import Action from './Action';
import BlotFormatter from '../BlotFormatter';
import ToolbarButton from './toolbar/ToolbarButton';

interface HandleStyle {
  width?: string;
  height?: string;
}

export default class ResizeAction extends Action {
  topLeftHandle: HTMLElement;
  topRightHandle: HTMLElement;
  bottomRightHandle: HTMLElement;
  bottomLeftHandle: HTMLElement;
  dragHandle: HTMLElement | null | undefined;
  dragStartX: number;
  dragCursorStyle: HTMLElement;
  preDragWidth: number;
  pinchStartDistance: number;
  calculatedAspectRatio: number;
  computedAspectRatio: string | undefined;
  target: HTMLElement | null | undefined;
  editorStyle: CSSStyleDeclaration | undefined;
  editorWidth: number;
  useRelativeSize: boolean;
  resizeModeButton: ToolbarButton | null;
  isUnclickable: boolean;
  hasResized: boolean;
  formattedWidth: string;
  private sizeInfoTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor(formatter: BlotFormatter) {
    super(formatter);
    this.topLeftHandle = this.createHandle('top-left', 'nwse-resize');
    this.topRightHandle = this.createHandle('top-right', 'nesw-resize');
    this.bottomRightHandle = this.createHandle('bottom-right', 'nwse-resize');
    this.bottomLeftHandle = this.createHandle('bottom-left', 'nesw-resize');
    this.dragHandle = null;
    this.dragStartX = 0;
    this.dragCursorStyle = document.createElement('style');
    this.preDragWidth = 0;
    this.pinchStartDistance = 0;
    this.calculatedAspectRatio = 0;
    this.editorWidth = 0;
    this.useRelativeSize = this.formatter.options.resize.useRelativeSize;
    this.resizeModeButton = null;
    this.isUnclickable = false;
    this.hasResized = false;
    this.formattedWidth = '';
    if (formatter.options.resize.allowResizeModeChange) {
      this.resizeModeButton = this.createResizeModeButton();
      this.toolbarButtons = [
        this.resizeModeButton
      ]
    }
  }

  onCreate() {
    this.target = this.formatter.currentSpec?.getTargetElement();
    this.isUnclickable = this.formatter.currentSpec?.isUnclickable || false;

    this.formatter.overlay.appendChild(this.topLeftHandle);
    this.formatter.overlay.appendChild(this.topRightHandle);
    this.formatter.overlay.appendChild(this.bottomRightHandle);
    this.formatter.overlay.appendChild(this.bottomLeftHandle);
    this.formatter.overlay.addEventListener('mousedown', this.onOverlayMouseDown)
    this.formatter.overlay.addEventListener('mouseup', this.onOverlayMouseUp)
    this.formatter.overlay.addEventListener(
      'touchstart',
      this.onOverlayTouchStart as EventListener,
      { passive: false } as EventListenerOptions
    );
    this.formatter.overlay.addEventListener(
      'touchmove',
      this.onOverlayTouchMove,
      { passive: false } as EventListenerOptions
    );
    this.formatter.overlay.addEventListener(
      'touchend',
      this.onOverlayTouchEnd,
      { passive: false } as EventListenerOptions
    );

    const handleStyle: HandleStyle = this.formatter.options.resize.handleStyle || {};
    this.repositionHandles(handleStyle);

  }

  onDestroy() {
    this.target = null;
    this.isUnclickable = false;
    this.setCursor('');
    this.formatter.overlay.removeChild(this.topLeftHandle);
    this.formatter.overlay.removeChild(this.topRightHandle);
    this.formatter.overlay.removeChild(this.bottomRightHandle);
    this.formatter.overlay.removeChild(this.bottomLeftHandle);
    this.formatter.overlay.removeEventListener('mousedown', this.onOverlayMouseDown)
    this.formatter.overlay.removeEventListener('mouseup', this.onOverlayMouseUp)
    this.formatter.overlay.removeEventListener(
      'touchstart',
      this.onOverlayTouchStart as EventListener,
      { passive: false } as EventListenerOptions
    );
    this.formatter.overlay.removeEventListener(
      'touchmove',
      this.onOverlayTouchMove as EventListener,
      { passive: false } as EventListenerOptions
    );
    this.formatter.overlay.removeEventListener(
      'touchend',
      this.onOverlayTouchEnd as EventListener,
      { passive: false } as EventListenerOptions
    );
    this.formatter.update();
  }

  createHandle(position: string, cursor: string): HTMLElement {
    // create resize handles
    const box = document.createElement('div');
    box.classList.add(this.formatter.options.resize.handleClassName);
    box.setAttribute('data-position', position);
    box.style.cursor = cursor;
    if (this.formatter.options.resize.handleStyle) {
      Object.assign(box.style, this.formatter.options.resize.handleStyle);
    }
    box.addEventListener('pointerdown', this.onHandlePointerDown);
    return box;
  }

  repositionHandles(handleStyle?: HandleStyle) {
    // position resize handles
    let handleXOffset = '0px';
    let handleYOffset = '0px';
    if (handleStyle) {
      if (handleStyle.width) {
        handleXOffset = `${-parseFloat(handleStyle.width) / 2}px`;
      }
      if (handleStyle.height) {
        handleYOffset = `${-parseFloat(handleStyle.height) / 2}px`;
      }
    }
    Object.assign(this.topLeftHandle.style, { left: handleXOffset, top: handleYOffset });
    Object.assign(this.topRightHandle.style, { right: handleXOffset, top: handleYOffset });
    Object.assign(this.bottomRightHandle.style, { right: handleXOffset, bottom: handleYOffset });
    Object.assign(this.bottomLeftHandle.style, { left: handleXOffset, bottom: handleYOffset });
  }

  setCursor(value: string) {
    // set document cursor to resize arrows on pointer down until pointer up
    if (document.body) {
      if (!!value) {
        this.dragCursorStyle.innerHTML = `body, body * { cursor: ${value} !important; }`;
        document.head.appendChild(this.dragCursorStyle);
      } else {
        try {
          // remove cursor style if exists
          document.head.removeChild(this.dragCursorStyle);
        } catch { }
      }
    }
  }

  resizeMode = (activate: boolean) => {
    if (activate) {
      // activate resize mode, show size info
      this.hasResized = false;
      this.formattedWidth = '';
      if (!!this.target) {
        // determine resize mode to use (absolute/relative)
        this.useRelativeSize = this.formatter.useRelative(this.target);
        // get inner editor width to calculate % values
        this.editorStyle = getComputedStyle(this.formatter.quill.root);
        this.editorWidth = this.formatter.quill.root.clientWidth -
          parseFloat(this.editorStyle.paddingLeft) -
          parseFloat(this.editorStyle.paddingRight);

        const rect = this.target.getBoundingClientRect();
        // prevent division by zero in the case that rect.height is 0 for some reason
        if (rect.height === undefined || rect.height === 0) {
          rect.height = this.target.clientHeight + 1;
        }
        this.preDragWidth = rect.width;
        this.computedAspectRatio = getComputedStyle(this.target).aspectRatio || 'auto'
        this.calculatedAspectRatio = rect.width / rect.height;

        if (this.useRelativeSize) {
          if (this.isUnclickable) {
            // strip height for relative iframe sizing, rely on aspect-ratio instead
            if (this.computedAspectRatio === 'auto') {
              // relative size on iframe requires aspect-ratio to be set - use default from options
              this.target.style.aspectRatio = this.formatter.options.video.defaultAspectRatio;
              console.warn(
                `No iframe aspect-ratio set. Set an aspect ratio either via custom blot or css.\n` +
                `Using temporary aspect ratio "${this.formatter.options.video.defaultAspectRatio}"`
              );
            }
          }
        } else {
          if (this.isUnclickable && this.computedAspectRatio !== 'auto') {
            // if aspect-ratio set via blot or css, try to use that ratio for new height instead
            const ratio = this.computedAspectRatio.match(/(\d+)\s*\/\s*(\d+)/);
            if (ratio) {
              try {
                this.calculatedAspectRatio = parseFloat(ratio[1]) / parseFloat(ratio[2]);
              } catch { }
            }
          }
        }
        // show size info box
        this.showSizeInfo(true, rect.width, rect.height);
      }
    } else {
      if (this.target && this.hasResized) {
        // round dimensions to whole numbers
        let width: string = this.roundDimension(this.formattedWidth);
        this.target.setAttribute('width', width);
        // set resize mode button selected status if inuded in toolbar
        if (this.formatter.toolbar.buttons['resizeMode']) {
          this.formatter.toolbar.buttons['resizeMode'].selected = this.isRelative;
        }
        // set --resize-width style attribute and data-relative-size attribute
        if (this.isUnclickable) {
          this.target.style.setProperty('--resize-width', `${width}`);
          this.target.dataset.relativeSize = `${this.isRelative}`
        } else {
          if (this.isAligned && this.target.parentElement) {
            this.target.parentElement.style.setProperty('--resize-width', `${width}`);
            this.target.parentElement.dataset.relativeSize = `${this.isRelative}`
          }
        }
      }

      this.formatter.update();
      // fade out size info box
      this.showSizeInfo(false);
    }
  };

  onHandlePointerDown = (event: PointerEvent) => {
    this.resizeMode(true);
    if (event.target instanceof HTMLElement && !!this.target) {
      this.dragHandle = event.target;
      this.setCursor(this.dragHandle.style.cursor);
      this.dragStartX = event.clientX;
      // enable drag behaviour until pointer up event
      document.addEventListener('pointermove', this.onHandleDrag);
      document.addEventListener('pointerup', this.onHandlePointerUp);
    }
  };

  onHandleDrag = (event: PointerEvent) => {
    // resize target + overlay
    if (this.target) {
      this.hasResized = true;
      const deltaX = event.clientX - this.dragStartX;
      let newWidth: number = 0;
      if (this.dragHandle === this.topLeftHandle || this.dragHandle === this.bottomLeftHandle) {
        newWidth = Math.round(this.preDragWidth - deltaX);
      } else {
        newWidth = Math.round(this.preDragWidth + deltaX);
      }
      // ensure width does not grow beyond editor width or shrink below minimumWidthPx
      newWidth = Math.max(Math.min(newWidth, this.editorWidth), this.formatter.options.resize.minimumWidthPx);
      // resize target + overlay
      this.resizeTarget(newWidth);
    }
  };

  onHandlePointerUp = () => {
    // disable resize mode, reset cursor, tidy up
    this.setCursor('');
    // this.formatter.hideProxy();
    this.resizeMode(false);
    // remove resize event listeners
    document.removeEventListener('pointermove', this.onHandleDrag);
    document.removeEventListener('pointerup', this.onHandlePointerUp);
  };

  // handle resize from pinch gesture
  private onOverlayTouchStart = (event: TouchEvent) => {
    if (event.target === this.formatter.overlay) {
      this.resizeMode(true);
      if (!!this.target && event.touches.length === 2) {
        event.preventDefault(); // Prevent default touch behavior like scrolling
        // Calculate the initial distance between two fingers
        this.pinchStartDistance = this.calculateDistance(event.touches[0], event.touches[1]);
        // Get the initial width of the element
        this.preDragWidth = this.target.clientWidth;
      }
    }
  }

  private onOverlayTouchMove = (event: TouchEvent) => {
    if (event.target === this.formatter.overlay) {
      if (!!this.target && event.touches.length === 2 && this.pinchStartDistance !== null && this.preDragWidth !== null) {
        event.preventDefault(); // Prevent default touch behaviour like scrolling
        if (this.target) {
          this.hasResized = true;
          // Calculate the current distance between two fingers
          const currentDistance = this.calculateDistance(event.touches[0], event.touches[1]);
          // Calculate the scale factor & new width
          const scale = currentDistance / this.pinchStartDistance;
          let newWidth: number = Math.round(this.preDragWidth * scale);
          // ensure width does not grow beyond editor width or shrink below 10px
          newWidth = Math.max(Math.min(newWidth, this.editorWidth), 10);
          // resize target + overlay
          this.resizeTarget(newWidth);
        }
      }
    }
  }

  private onOverlayTouchEnd = (event: TouchEvent) => {
    if (event.target === this.formatter.overlay) {
      this.resizeMode(false);
    }
  }

  private onOverlayMouseDown = (event: MouseEvent) => {
    if (event.target === this.formatter.overlay) {
      this.resizeMode(true);
    }
  }

  private onOverlayMouseUp = (event: MouseEvent) => {
    if (event.target === this.formatter.overlay) {
      this.resizeMode(false);
    }
  }

  resizeTarget(newWidth: number) {
    if (this.target) {
      // update size info display
      const newHeight: number = newWidth / this.calculatedAspectRatio;
      this.updateSizeInfo(newWidth, newHeight);
      // set new dimensions on target
      if (this.formatter.useRelative(this.target)) {
        this.formattedWidth = `${100 * newWidth / this.editorWidth}%`;
      } else {
        this.formattedWidth = `${newWidth}px`;
      }
      this.target.setAttribute('width', this.formattedWidth);
      this.target.setAttribute('height', 'auto');

      // update width style property to wrapper if image and has imageAlign format
      // width needed to size wrapper correctly via css
      // set fixed height to unclickable if using absolute size mode and no aspect ratio given
      if (this.isUnclickable) {
        if (!this.useRelativeSize && this.computedAspectRatio === 'auto') {
          this.target.setAttribute('height', `${(newWidth / this.calculatedAspectRatio) | 0}px`)
        }
        this.target.style.setProperty('--resize-width', this.formattedWidth);
      } else if (!this.isUnclickable && this.isAligned && !!this.target.parentElement) {
        this.target.parentElement.style.setProperty('--resize-width', this.formattedWidth);
      }
      // updates overlay position
      this.formatter.update();
    }
  }

  showSizeInfo(show: boolean, width: number | null = null, height: number | null = null) {
    if (show) {
      this.cancelSizeInfoTimer();
      if (width !== null && height !== null) {
        this.updateSizeInfo(width, height);
      }
      this.formatter.sizeInfo.style.transition = '';
      this.formatter.sizeInfo.style.opacity = '1';
    }
    else {
      // fade out size info box
      this.closeSizeInfo();
    }
  }

  updateSizeInfo(width: number, height: number) {
    width = Math.round(width)
    height = Math.round(height)
    let size: string = `${width} x ${height}px`
    if (this.isRelative) {
      // show relative size with displayed size in brackets
      size = `${Math.round(100 * width / this.editorWidth)}% (${size})`;
    } else if (!this.hasResized) {
      // additional logic for absolute sizes when not resizing blot, in case displayed width does not represent true width
      const setWidth: string | null | undefined = this.target?.getAttribute('width');
      if (!!setWidth) {
        // if width attribute value is not the displayed width, show that size with displayed in brackets
        if (parseFloat(setWidth) !== width) {
          const aspectRatio: number = width / height;
          size = `${setWidth} x ${Math.round(parseFloat(setWidth) / aspectRatio)}px (${size})`;
        }
      } else if (this.target instanceof HTMLImageElement) {
        // no width attribute, if image, show natural dimensions first if not the same as displayed size
        if (this.target.naturalWidth !== width) {
          size = `${this.target.naturalWidth} x ${this.target.naturalHeight}px (${size})`;
        }
      }
    }
    this.formatter.sizeInfo.innerText = size;
  }

  get isRelative(): boolean {
    return this.target?.getAttribute('width')?.endsWith('%') || false;
  }

  get isAligned(): boolean {
    if (this.target) {
      return this.target.hasAttribute('data-blot-align');
    } else {
      return false;
    }
  }

  createResizeModeButton(): ToolbarButton {
    const button = new ToolbarButton(
      'resizeMode',
      this.onResizeModeClickHandler,
      this.formatter.options.toolbar,
    );
    button.preselect = () => {
      return this.isRelative;
    }
    return button
  }

  onResizeModeClickHandler: EventListener = (event: Event) => {
    event.stopImmediatePropagation();
    this.swapResizeMode(true);
  }

  swapResizeMode(showInfo: boolean = false) {
    if (this.target) {
      const rect: DOMRect = this.target.getBoundingClientRect();
      this.editorStyle = getComputedStyle(this.formatter.quill.root);
      this.editorWidth = this.formatter.quill.root.clientWidth -
        parseFloat(this.editorStyle.paddingLeft) -
        parseFloat(this.editorStyle.paddingRight);
      let newWidth: string;
      if (this.isRelative) {
        newWidth = `${Math.round(rect.width)}px`;
      } else {
        newWidth = `${Math.round(100 * rect.width / this.editorWidth)}%`;
      }
      this.target.setAttribute('width', `${newWidth}`);
      this.target.setAttribute('height', 'auto');
      if (this.formatter.currentSpec?.isUnclickable) {
        this.target.style.setProperty('--resize-width', `${newWidth}`);
        this.target.dataset.relativeSize = `${this.isRelative}`;
      } else {
        if (this.isAligned && this.target.parentElement) {
          this.target.parentElement.style.setProperty('--resize-width', `${newWidth}`);
          this.target.parentElement.dataset.relativeSize = `${this.isRelative}`;
        }
      }
      this.formatter.toolbar.buttons['resizeMode'].selected = this.isRelative;
      this.formatter.update();
      if (showInfo) {
        this.showSizeInfo(true, rect.width, rect.height);
        this.showSizeInfo(false);
      }
    }
  }

  closeSizeInfo() {
    this.sizeInfoTimerId = setTimeout(() => {
      this.formatter.sizeInfo.style.transition = 'opacity 1s';
      this.formatter.sizeInfo.style.opacity = '0';
    }, 1000);
  }

  cancelSizeInfoTimer() {
    if (this.sizeInfoTimerId !== null) {
      clearTimeout(this.sizeInfoTimerId);
      this.sizeInfoTimerId = null;
    }
  }

  private calculateDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  roundDimension(dim: string): string {
    // round string number with units (prefix and/or suffix): '-$34.565c' -> '-$35c', '21.244px' -> '24px'
    return dim.replace(/([^0-9.-]*)(-?[\d.]+)(.*)/, (_, prefix, num, suffix) => `${prefix}${Math.round(Number(num))}${suffix}`);
  }
}
