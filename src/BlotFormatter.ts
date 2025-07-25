import Quill from 'quill';
import deepmerge from 'deepmerge';
import Options from './Options';
import { DefaultOptions } from './DefaultOptions';
import Action from './actions/Action';
import BlotSpec from './specs/BlotSpec';
import Image from './blots/Image';
import VideoResponsive from './blots/Video';
import Toolbar from './actions/toolbar/Toolbar';
import CaretAction from './actions/CaretAction';

const dontMerge = (destination: Array<any>, source: Array<any>) => source;

enum PointerPosition {
  LEFT = 'left',
  RIGHT = 'right',
  ABOVE = 'above',
  BELOW = 'below',
  INSIDE = 'inside',
}

export default class BlotFormatter {
  quill: any;
  options: Options;
  currentSpec: BlotSpec | null;
  specs: BlotSpec[];
  overlay: HTMLElement;
  toolbar: Toolbar;
  sizeInfo: HTMLElement;
  actions: Action[];
  startX: number = 0; // touch scroll tracking
  startY: number = 0;

  constructor(quill: any, options: Partial<Options> = {}) {
    this.quill = quill;
    this.currentSpec = null;
    this.actions = [];

    // disable Blot Formatter behaviour when editor is read only
    if (quill.options.readOnly) {
      this.options = DefaultOptions;
      this.toolbar = new Toolbar(this);
      this.specs = [];
      this.overlay = document.createElement('div');
      this.sizeInfo = document.createElement('div');
      return;
    }

    // merge custom options with default
    this.options = deepmerge(DefaultOptions, options, { arrayMerge: dontMerge });
    // create overlay & size info plus associated event listeners 
    [this.overlay, this.sizeInfo] = this.createOverlay();
    this.addEventListeners();
    // create overlay toolbar
    this.toolbar = new Toolbar(this);
    // define which specs to be formatted, initialise each
    this.specs = this.options.specs.map(
      (SpecClass: new (formatter: BlotFormatter) => BlotSpec) => new SpecClass(this)
    );
    this.specs.forEach(spec => spec.init());
    // disable native image resizing on firefox
    document.execCommand('enableObjectResizing', false, 'false'); // eslint-disable-line no-undef
    // set position relative on quill container for absolute positioning of overlay & proxies 
    this.quill.container.style.position = this.quill.container.style.position || 'relative';
    // register custom blots as per options
    this.registerCustomBlots();
    // register keyboard bindings as per options
    this.keyboardBindings();
  }

  show(spec: BlotSpec) {
    // clear overlay in case show called while overlay active on other blot
    this.hide();
    this.currentSpec = spec;
    this.currentSpec.setSelection();
    this.setUserSelect('none');
    this.quill.container.appendChild(this.overlay);
    this.repositionOverlay();
    this.createActions(spec);
    this.toolbar.create();
    document.addEventListener('pointerdown', this.onDocumentPointerDown);
  }

  hide(event: PointerEvent | null = null) {
    if (this.currentSpec) {
      if (event) {
        const targetBlot = this.currentSpec!.getTargetBlot();
        if (targetBlot) {
          const position = this.getClickPosition(event);
          if (position === PointerPosition.LEFT) {
            CaretAction.placeCaretBeforeBlot(this.quill, targetBlot);
          } else if (position === PointerPosition.RIGHT) {
            CaretAction.placeCaretAfterBlot(this.quill, targetBlot);
          }
        }
      }
      this.currentSpec.onHide();
      this.currentSpec = null;
      this.quill.container.removeChild(this.overlay);
      document.removeEventListener('pointerdown', this.onDocumentPointerDown);
      this.overlay.style.setProperty('display', 'none');
      this.setUserSelect('');
      this.destroyActions();
      this.toolbar.destroy();
      // TEXT_CHANGE event clears resize cursor from image when form is saved while overlay still active
      this.quill.emitter.emit(
        this.quill.constructor.events.TEXT_CHANGE, 0, this.quill.getLength(), 'api'
      );
    }
  }

  update() {
    this.repositionOverlay();
    this.actions.forEach(action => action.onUpdate());
  }

  createActions(spec: BlotSpec) {
    this.actions = spec.getActions().map((action: Action) => {
      action.onCreate();
      return action;
    });
  }

  destroyActions() {
    this.actions.forEach((action: Action) => action.onDestroy());
    this.actions = [];
  }

  private createOverlay(): [HTMLElement, HTMLElement] {
    const overlay = document.createElement('div');
    // set up overlay element
    overlay.classList.add(this.options.overlay.className);
    if (this.options.overlay.style) {
      Object.assign(overlay.style, this.options.overlay.style);
    }
    // prevent overlay being selectable
    overlay.style.userSelect = 'none';
    overlay.style.setProperty('-webkit-user-select', 'none');
    overlay.style.setProperty('-moz-user-select', 'none');
    overlay.style.setProperty('-ms-user-select', 'none');

    const sizeInfo = document.createElement('div');
    if (this.options.overlay.sizeInfoStyle) {
      Object.assign(sizeInfo.style, this.options.overlay.sizeInfoStyle);
    }
    overlay.appendChild(sizeInfo);

    return [overlay, sizeInfo]
  }

  private addEventListeners(): void {
    // overlay event listeners
    // scroll the quill root on mouse wheel & touch move event
    this.overlay.addEventListener('wheel', this.passWheelEventThrough, { passive: false });
    this.overlay.addEventListener('touchstart', this.onTouchScrollStart, { passive: false });
    this.overlay.addEventListener('touchmove', this.onTouchScrollMove, { passive: false });
    // disable context menu on overlay
    this.overlay.addEventListener('contextmenu', (event) => {
      event.stopPropagation();
      event.preventDefault();
    });

    // quill root event listeners
    // scroll visible overlay if editor is scrollable
    this.repositionOverlay = this.repositionOverlay.bind(this);
    this.quill.root.addEventListener('scroll', this.repositionOverlay);
    // reposition overlay element if editor resized
    new ResizeObserver(() => {
      this.repositionOverlay();
    }).observe(this.quill.root);
    // dismiss overlay if active and click on quill root
    this.quill.root.addEventListener('click', this.onClick);
  }

  private repositionOverlay() {
    if (this.currentSpec) {
      const overlayTarget = this.currentSpec.getOverlayElement();
      if (overlayTarget) {
        const containerRect: DOMRect = this.quill.container.getBoundingClientRect();
        const specRect: DOMRect = overlayTarget.getBoundingClientRect();
        Object.assign(this.overlay.style, {
          display: 'block',
          left: `${specRect.left - containerRect.left - 1 + this.quill.container.scrollLeft}px`,
          top: `${specRect.top - containerRect.top + this.quill.container.scrollTop}px`,
          width: `${specRect.width}px`,
          height: `${specRect.height}px`,
        });
      }
    }
  }

  private setUserSelect(value: string) {
    const props: string[] = [
      'userSelect',
      'mozUserSelect',
      'webkitUserSelect',
      'msUserSelect',
    ];

    props.forEach((prop: string) => {
      // set on contenteditable element and <html>
      this.quill.root.style.setProperty(prop, value);
      if (document.documentElement) {
        document.documentElement.style.setProperty(prop, value);
      }
    });
  }

  private onDocumentPointerDown = (event: PointerEvent) => {
    // if clicked outside of quill editor and not the alt/title modal or iframe proxy image, dismiss overlay 
    const target = event.target as HTMLElement;
    if (!(
      this.quill.root.parentNode.contains(target) ||
      target.closest('div[data-blot-formatter-modal]') ||
      target.classList.contains('blot-formatter__proxy-image')
    )) {
      this.hide(event);
    }
  }

  private onClick = (event: PointerEvent) => {
    this.hide(event);
  }

  passWheelEventThrough = (event: WheelEvent) => {
    // scroll the quill root element when overlay or proxy wheel scrolled
    this.quill.root.scrollLeft += event.deltaX;
    this.quill.root.scrollTop += event.deltaY;
  };

  onTouchScrollStart = (event: TouchEvent) => {
    // Record the initial touch positions
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.startX = touch.clientX;
      this.startY = touch.clientY;
    }
  };

  onTouchScrollMove = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const deltaX = this.startX - touch.clientX;
      const deltaY = this.startY - touch.clientY;

      const root = this.quill.root;

      // Check if we can scroll further vertically and horizontally
      const atTop = root.scrollTop === 0;
      const atBottom = root.scrollTop + root.clientHeight === root.scrollHeight;
      const atLeft = root.scrollLeft === 0;
      const atRight = root.scrollLeft + root.clientWidth === root.scrollWidth;

      // Determine if we're scrolling vertically or horizontally
      const isScrollingVertically = Math.abs(deltaY) > Math.abs(deltaX);
      const isScrollingHorizontally = Math.abs(deltaX) > Math.abs(deltaY);

      let preventDefault = false;

      // If scrolling vertically
      if (isScrollingVertically) {
        if (!(atTop && deltaY < 0) && !(atBottom && deltaY > 0)) {
          preventDefault = true; // Prevent default only if we can scroll further
          root.scrollTop += deltaY;
        }
      }

      // If scrolling horizontally
      if (isScrollingHorizontally) {
        if (!(atLeft && deltaX < 0) && !(atRight && deltaX > 0)) {
          preventDefault = true; // Prevent default only if we can scroll further
          root.scrollLeft += deltaX;
        }
      }

      if (preventDefault) {
        event.preventDefault(); // Prevent default scrolling if necessary
      }

      // Update start positions for the next move event
      this.startX = touch.clientX;
      this.startY = touch.clientY;
    }
  };

  onOverlayTouchScrollMove = (event: TouchEvent) => {
    this.onTouchScrollMove(event);
    this.repositionOverlay();
  }

  registerCustomBlots() {
    // register image bot with title attribute support
    if (this.options.image.registerImageTitleBlot) {
      Quill.register(Image, true);
    }
    // register custom video blot with initial width 100% & aspect ratio from options
    if (this.options.video.registerCustomVideoBlot) {
      VideoResponsive.aspectRatio = this.options.video.defaultAspectRatio;
      Quill.register(VideoResponsive, true);
    }
  }

  keyboardBindings() {
    // add backspace keyboard bindings
    // patch that fixes Quill bug #4364 (https://github.com/slab/quill/issues/4364)
    if (this.options.video.registerBackspaceFix) {
      if (!this.quill.keyboard.bindings.Backspace) {
        this.quill.keyboard.bindings.Backspace = []
      }
      this.quill.keyboard.bindings.Backspace.unshift({
        key: 'Backspace',
        empty: true,
        line: {
          domNode: {
            tagName: "IFRAME"
          }
        },
        handler: (range: any) => {
          this.quill.deleteText(range.index - 1, 1, "user");
        }
      });
    }
    // handles moving the cursor past the image when format set
    // without this, cursor stops and stays hidden at the image location
    if (this.options.image.registerArrowRightFix) {
      if (!this.quill.keyboard.bindings.ArrowRight) {
        this.quill.keyboard.bindings.ArrowRight = []
      }
      this.quill.keyboard.bindings.ArrowRight.unshift({
        key: 'ArrowRight',
        collapsed: true,
        empty: false,
        suffix: /^$/,
        line: {
          domNode: {
            tagName: "P"
          }
        },
        handler: (range: any, context: any) => {
          const index = range.index + range.length;
          const documentLength = this.quill.getLength();
          if (index + 1 >= documentLength - 1) {
            // For the last blot, place cursor at the very end
            this.quill.setSelection(documentLength - 1, 0, "user");
          } else {
            // overshoot by one then use native browser API to send caret back one
            // without this, caret will be placed inside formatting span wrapper
            this.quill.setSelection(index + 2, 0, "user");
            CaretAction.sendCaretBack(1); // Move cursor back by 1 character
          }
        }
      });
    }
  }

  useRelative(targetElement: HTMLElement): boolean {
    if (!this.options.resize.allowResizeModeChange) {
      // mode change not allowed, always take useRelativeSize value
      return this.options.resize.useRelativeSize;
    } else {
      // if no width set, use useRelativeSize by default else respect existing type
      const width: string | null = targetElement.getAttribute('width');
      if (!width) {
        return this.options.resize.useRelativeSize;
      } else {
        return width.endsWith('%');
      }
    }
  }

  getClickPosition = (event: PointerEvent): PointerPosition => {
    const target = this.overlay;
    const rect = target.getBoundingClientRect();

    if (event.clientY < rect.top) {
      return PointerPosition.ABOVE;
    } else if (event.clientY > rect.bottom) {
      return PointerPosition.BELOW;
    } else if (event.clientX < rect.left) {
      return PointerPosition.LEFT;
    } else if (event.clientX > rect.right) {
      return PointerPosition.RIGHT;
    } else {
      return PointerPosition.INSIDE;
    }
  }
}
