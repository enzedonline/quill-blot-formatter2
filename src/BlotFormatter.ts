import Action from './actions/Action';
import BlotSpec from './specs/BlotSpec';
import CaretAction from './actions/CaretAction';
import deepmerge from 'deepmerge';
import Image from './blots/Image';
import Quill from 'quill';
import Toolbar from './actions/toolbar/Toolbar';
import VideoResponsive from './blots/Video';
import type { AttributorClass } from './actions/align/AlignFormats';
import { createIframeAlignAttributor, createImageAlignAttributor } from './actions/align/AlignFormats';
import { DefaultOptions } from './DefaultOptions';
import type { Options } from './Options';
import TooltipContainPosition from './tooltip/TooltipContainPosition';

const dontMerge = (destination: Array<any>, source: Array<any>) => source;

/**
 * Represents the possible positions of a pointer relative to the formatter overlay.
 *
 * - `LEFT`: The pointer is positioned to the left of the overlay.
 * - `RIGHT`: The pointer is positioned to the right of the overlay.
 * - `ABOVE`: The pointer is positioned above the overlay.
 * - `BELOW`: The pointer is positioned below the overlay.
 * - `INSIDE`: The pointer is positioned inside the overlay.
 */
enum PointerPosition {
  LEFT = 'left',
  RIGHT = 'right',
  ABOVE = 'above',
  BELOW = 'below',
  INSIDE = 'inside',
}

type PxString = `${number}px`;
type CssRectPx = {
  left: PxString;
  top: PxString;
  width: PxString;
  height: PxString;
};

/**
 * BlotFormatter is a Quill module that provides an interactive overlay for formatting embedded blots
 * (such as images, iframes, and videos) within the Quill rich text editor. It enables resizing, alignment,
 * and other custom actions on supported blots via a floating UI, and manages all related event handling,
 * DOM manipulation, and integration with Quill's API.
 *
 * Features:
 * - Displays an overlay with handles and a toolbar for formatting selected blots.
 * - Supports custom actions, alignment, and resizing (with both relative and absolute sizing).
 * - Integrates with Quill's keyboard bindings to fix known issues with embedded content.
 * - Handles touch and mouse interactions, including scrolling and context menu suppression.
 * - Registers and manages custom blots and attributors for advanced formatting.
 * - Provides robust cleanup and destruction of all event listeners and DOM elements.
 * - Exposes debugging hooks and logs when enabled via options.
 *
 * Usage:
 * Instantiate with a Quill editor instance and optional configuration options.
 * The formatter automatically attaches to the editor and manages its own lifecycle.
 *
 * Example:
 * ```typescript
 * const quill = new Quill('#editor', { ... });
 * const blotFormatter = new BlotFormatter(quill, { debug: true });
 * ```
 *
 * @template Options - The configuration options type for the formatter.
 * @template BlotSpec - The specification interface for supported blots.
 * @template Action - The interface for custom actions available in the overlay.
 *
 * @public
 */
export default class BlotFormatter {
  Quill: typeof Quill;
  quill: any;
  options: Options;
  currentSpec: BlotSpec | null;
  specs: BlotSpec[];
  overlay: HTMLElement;
  toolbar: Toolbar;
  sizeInfo: HTMLElement;
  actions: Action[];
  private _startX: number = 0; // touch scroll tracking
  private _startY: number = 0;
  private _abortController?: AbortController;
  private _resizeObserver?: ResizeObserver;
  private _tooltipContainPosition?: TooltipContainPosition;
  ImageAlign: AttributorClass;
  IframeAlign: AttributorClass;

  constructor(quill: any, options: Partial<Options> = {}) {
    this.Quill = quill.constructor;
    this.quill = quill;
    this.currentSpec = null;
    this.actions = [];
    if (options.debug) {
      (window as any).blotFormatter = this;
    }

    // Register the custom align formats with Quill
    const ImageAlignClass = createImageAlignAttributor(this.Quill);
    const IframeAlignClass = createIframeAlignAttributor(this.Quill);

    // Create instances of the classes
    this.ImageAlign = new ImageAlignClass();
    this.IframeAlign = new IframeAlignClass();

    // Register the align formats with Quill
    if (options.debug) console.debug('Registering custom align formats', this.ImageAlign, this.IframeAlign);
    this.Quill.register({
      'formats/imageAlign': this.ImageAlign,
      'attributors/class/imageAlign': this.ImageAlign,
      'formats/iframeAlign': this.IframeAlign,
      'attributors/class/iframeAlign': this.IframeAlign,
    }, true);

    // disable Blot Formatter behaviour when editor is read only
    if (quill.options.readOnly) {
      this.options = DefaultOptions;
      this.toolbar = new Toolbar(this);
      this.specs = [];
      this.overlay = document.createElement('div');
      this.sizeInfo = document.createElement('div');
      if (options.debug) console.debug('BlotFormatter disabled in read-only mode');
      return;
    }

    // merge custom options with default
    this.options = deepmerge(DefaultOptions, options, { arrayMerge: dontMerge });
    if (options.debug) console.debug('BlotFormatter options', this.options);
    // create overlay & size info plus associated event listeners 
    [this.overlay, this.sizeInfo] = this._createOverlay();
    this._addEventListeners();
    // create overlay toolbar
    this.toolbar = new Toolbar(this);
    if (options.debug) console.debug('BlotFormatter toolbar', this.toolbar);
    // define which specs to be formatted, initialise each
    this.specs = this.options.specs.map(
      (SpecClass: new (formatter: BlotFormatter) => BlotSpec) => new SpecClass(this)
    );
    this.specs.forEach(spec => spec.init());
    if (options.debug) console.debug('BlotFormatter specs', this.specs);
    // set position relative on quill container for absolute positioning of overlay & proxies 
    this.quill.container.style.position = this.quill.container.style.position || 'relative';
    // register custom blots as per options
    this._registerCustomBlots();
    // register keyboard bindings as per options
    this._keyboardBindings();
    // add tooltip position fix if enabled
    if (this.options.debug) console.debug('tooltip option', this.options.tooltip?.containTooltipPosition)
    if (this.options.tooltip?.containTooltipPosition) {
      this._tooltipContainPosition = new TooltipContainPosition(this.quill, this.options.debug);
    }

  }


  /**
   * Destroys the BlotFormatter instance, cleaning up event listeners, actions, toolbar,
   * and DOM references. Also removes any global references and clears internal state.
   * Logs a debug message if the `debug` option is enabled.
   * Catches and logs any errors that occur during the destruction process.
   */
  destroy = (): void => {
    try {
      this.hide();
      this._removeEventListeners();
      this._destroyActions();
      this.toolbar?.destroy();

      // Clean up DOM references
      if (this.overlay?.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }

      // Clear references
      this.currentSpec = null;
      this.specs = [];
      this.actions = [];

      if (this.options.tooltip?.containTooltipPosition && this._tooltipContainPosition) {
        this._tooltipContainPosition?.destroy();
      }

      // Remove global reference
      if ((window as any).bf === this) {
        delete (window as any).bf;
      }

      this.quill = null;
      if (this.options.debug) console.debug('BlotFormatter destroyed');
    } catch (error) {
      console.error('BlotFormatter.destroy error:', error);
    }
  };

  /**
   * Displays the blot formatter overlay for the specified blot.
   *
   * This method performs the following actions:
   * - Hides any open Quill tooltips (such as hyperlink dialogs).
   * - Optionally exposes the formatter instance for debugging.
   * - Clears any existing overlay if active on another blot.
   * - Sets the current blot specification and selection.
   * - Disables user selection to prevent unwanted interactions.
   * - Appends the overlay to the Quill editor container.
   * - Repositions the overlay to match the blot's position.
   * - Creates action buttons or controls for the current blot.
   * - Initializes the toolbar for the formatter.
   * - Adds a document-level pointerdown event listener to handle outside clicks.
   * - Logs debug information if enabled in options.
   *
   * @param spec - The specification of the blot (*BlotSpec*) to be formatted.
   * @returns void
   */
  show = (spec: BlotSpec): void => {
    try {
      // hide any open tooltips (closes open hyperlink dialog and more)
      this.quill.container.querySelectorAll('.ql-tooltip:not(.ql-hidden)').forEach(
        (tooltip: HTMLElement) => {
          tooltip.classList.add('ql-hidden');
        }
      );
      // expose formatter for debugging
      if (this.options.debug) (window as any).blotFormatter = this;
      // clear overlay in case show called while overlay active on other blot
      this.hide();
      this.currentSpec = spec;
      this.currentSpec.setSelection();
      this._setUserSelect('none');
      this.quill.container.appendChild(this.overlay);
      this._repositionOverlay();
      this._createActions(spec);
      this.toolbar.create();
      this._scrollToolbarIntoView(this.toolbar.element);
      document.addEventListener('pointerdown', this._onDocumentPointerDown);
      if (this.options.debug) console.debug('BlotFormatter show', spec);
    } catch (error) {
      console.error('Error showing BlotFormatter:', error);
      this.hide();
      // Re-throw the error to ensure it can be handled by the caller if needed
      throw error;
    }
  }

  /**
   * Hides the blot formatter overlay and performs necessary cleanup.
   *
   * If a pointer event is provided, determines the click position relative to the target blot
   * and places the caret before or after the blot accordingly. Calls the `onHide` method of the
   * current spec, removes the overlay from the DOM, removes event listeners, resets user selection,
   * destroys toolbar and actions, and emits a `TEXT_CHANGE` event to ensure the editor state is updated.
   *
   * @param event - Optional pointer event that triggered the hide action. Used to determine caret placement.
   */
  hide = (event: PointerEvent | null = null): void => {
    if (this.currentSpec) {
      if (event) {
        const targetBlot = this.currentSpec!.getTargetBlot();
        if (targetBlot) {
          const position = this._getClickPosition(event);
          if (position === PointerPosition.LEFT) {
            if (this.options.debug) console.debug('Click position: LEFT');
            CaretAction.placeCaretBeforeBlot(this.quill, targetBlot);
          } else if (position === PointerPosition.RIGHT) {
            if (this.options.debug) console.debug('Click position: RIGHT');
            CaretAction.placeCaretAfterBlot(this.quill, targetBlot);
          }
        }
      }
      this.currentSpec.onHide();
      this.currentSpec = null;
      this.quill.container.removeChild(this.overlay);
      document.removeEventListener('pointerdown', this._onDocumentPointerDown);
      this.overlay.style.setProperty('display', 'none');
      this._setUserSelect('');
      this._destroyActions();
      this.toolbar.destroy();
      // TEXT_CHANGE event clears resize cursor from image when form is saved while overlay still active
      this.quill.emitter.emit(
        this.quill.constructor.events.TEXT_CHANGE, 0, this.quill.getLength(), 'api'
      );
    }
    if (this.options.debug) console.debug('BlotFormatter hide');
  }

  /**
   * Updates the state of the BlotFormatter overlay and its associated actions.
   *
   * This method repositions the overlay to match the current selection or formatting context,
   * triggers the `onUpdate` method for each registered action, and logs a debug message if
   * debugging is enabled in the options.
   *
   * @returns {void}
   */
  update = (): void => {
    this._repositionOverlay();
    this.actions.forEach(action => action.onUpdate());
    if (this.options.debug) console.debug('BlotFormatter update');
  }

  /**
   * Initializes the actions for the given blot specification.
   * 
   * This method retrieves the list of actions from the provided `spec` using `getActions()`,
   * calls the `onCreate()` lifecycle method on each action, and assigns the resulting array
   * to the `actions` property. If debugging is enabled in the options, it logs each created action.
   *
   * @param spec - The blot specification containing the actions to initialize.
   */
  private _createActions = (spec: BlotSpec): void => {
    this.actions = spec.getActions().map((action: Action) => {
      action.onCreate();
      if (this.options.debug) console.debug('BlotFormatter action created', action);
      return action;
    });
  }

  /**
   * Destroys all registered actions by calling their `onDestroy` method and clearing the actions array.
   * If debugging is enabled in the options, logs a debug message to the console.
   *
   * @private
   */
  private _destroyActions = (): void => {
    this.actions.forEach((action: Action) => action.onDestroy());
    this.actions = [];
    if (this.options.debug) console.debug('BlotFormatter actions destroyed');
  }

  /**
   * Creates and configures the overlay and size info HTML elements used for formatting blots.
   *
   * The overlay element is styled and configured to be non-selectable, and the size info element
   * is appended to the overlay. Both elements can be customized via the `options.overlay` property.
   * 
   * @returns A tuple containing the overlay HTMLElement and the size info HTMLElement.
   */
  private _createOverlay = (): [HTMLElement, HTMLElement] => {
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
    if (this.options.debug) console.debug('BlotFormatter overlay created', overlay, sizeInfo);
    return [overlay, sizeInfo]
  }

  /**
   * Ensures that the toolbar element is visible within the viewport of the Quill editor.
   * If the toolbar is positioned above the visible area of the editor, it scrolls the target element into view
   * with an offset equal to the toolbar's height, then recalculates the toolbar's position.
   * If the toolbar is still above the viewport, it scrolls the window to bring the toolbar into view smoothly.
   *
   * @param toolbarElement - The HTML element representing the toolbar to be scrolled into view.
   * @returns A promise that resolves when any necessary scrolling has completed.
   */
  private _scrollToolbarIntoView = async (toolbarElement: HTMLElement): Promise<void> => {
    let toolbarRect = toolbarElement.getBoundingClientRect();
    const quillRect = this.quill.container.getBoundingClientRect();

    const targetElement = this.currentSpec?.getTargetElement();
    if (toolbarRect.top - quillRect.top < 0) {
      if (targetElement) {
        // Wait for the smooth scroll to complete
        await this._scrollIntoViewWithOffset(targetElement, toolbarRect.height);
        // Now recalculate the toolbar position
        toolbarRect = toolbarElement.getBoundingClientRect();
      }
    }
    // If toolbar is still above the viewport, scroll the window
    if (toolbarRect.top < 0) {
      if (this.options.debug) {
        console.debug(`Scrolling window ${toolbarRect.top - toolbarRect.height}px to bring toolbar into view`);
      }
      window.scrollBy({ top: toolbarRect.top - toolbarRect.height, behavior: 'smooth' });
    }
  }

  /**
   * Scrolls the first scrollable ancestor of the given element into view with a specified offset.
   * If the element is outside the visible bounds of its scrollable ancestor, the ancestor is scrolled
   * so that the element is visible with the given offset from the top. Returns a promise that resolves
   * when scrolling has completed (or immediately if no scrolling was necessary).
   *
   * @param el - The target HTMLElement to scroll into view.
   * @param offset - The number of pixels to offset from the top of the scrollable ancestor (default: 10).
   * @returns A promise that resolves when scrolling is finished.
   */
  private _scrollIntoViewWithOffset = (el: HTMLElement, offset = 10): Promise<void> => {
    return new Promise((resolve) => {
      let scrollingElement: Element | null = null;

      for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
        const { overflowY } = getComputedStyle(ancestor);
        if (!['auto', 'scroll'].includes(overflowY) || ancestor.scrollHeight <= ancestor.clientHeight) continue;

        const containerRect = ancestor.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        if (elRect.top < containerRect.top + offset) {
          scrollingElement = ancestor;
          ancestor.scrollTo({
            top: ancestor.scrollTop + elRect.top - containerRect.top - offset
          });
          if (this.options.debug) {
            console.debug(`Scrolling ancestor ${ancestor.tagName} to bring element into view with offset ${offset}px`);
          }
          break; // Only scroll the first scrollable ancestor
        }
      }

      if (scrollingElement) {
        // Wait for smooth scroll to complete
        const checkScrollEnd = () => {
          let lastScrollTop = scrollingElement!.scrollTop;
          const checkInterval = setInterval(() => {
            if (scrollingElement!.scrollTop === lastScrollTop) {
              // Scroll has stopped
              clearInterval(checkInterval);
              resolve();
            } else {
              lastScrollTop = scrollingElement!.scrollTop;
            }
          }, 50); // Check every 50ms
        };

        // Start checking after a brief delay
        setTimeout(checkScrollEnd, 100);
      } else {
        // No scrolling occurred
        resolve();
      }
    });
  };

  /**
   * Adds all necessary event listeners to the overlay and Quill root elements.
   *
   * - For the overlay:
   *   - Forwards mouse wheel and touch move events to allow scrolling.
   *   - Disables the context menu to prevent default browser actions.
   * - For the Quill root:
   *   - Repositions the overlay on scroll and resize events.
   *   - Dismisses the overlay when clicking on the Quill root.
   *
   * This method ensures proper interaction and synchronization between the overlay
   * and the Quill editor, handling user input and UI updates.
   *
   * @private
   */
  private _addEventListeners = (): void => {
    this._abortController = new AbortController();
    const { signal } = this._abortController;

    // overlay event listeners
    // scroll the quill root on mouse wheel & touch move event - do not use default 'passive' on these
    this.overlay.addEventListener('wheel', this._passWheelEventThrough, { passive: false, signal });
    this.overlay.addEventListener('touchstart', this._onTouchScrollStart, { passive: false, signal });
    this.overlay.addEventListener('touchmove', this._onTouchScrollMove, { passive: false, signal });
    // disable context menu on overlay
    this.overlay.addEventListener('contextmenu', this._preventContextMenu, { signal });
    // dismiss overlay if active and click on quill root
    this.quill.root.addEventListener('click', this._onClick, { signal });

    // quill root event listeners
    // scroll visible overlay if editor is scrollable
    this.quill.root.addEventListener('scroll', this._repositionOverlay, { signal });

    this._resizeObserver = new ResizeObserver(this._repositionOverlay);
    this._resizeObserver.observe(this.quill.root);
  }

  /**
   * Removes event listeners and observers associated with the instance.
   * 
   * Aborts any ongoing operations managed by the internal AbortController,
   * and disconnects the internal ResizeObserver to stop observing changes.
   *
   * @private
   */
  private _removeEventListeners = (): void => {
    this._abortController?.abort();
    this._resizeObserver?.disconnect();
  };

  /**
   * Prevents the default context menu from appearing and stops the event from propagating further.
   *
   * @param event - The event object associated with the context menu action.
   */
  private _preventContextMenu = (event: Event): void => {
    event.stopPropagation();
    event.preventDefault();
  };

  /**
   * Repositions the overlay element to align with the currently selected blot's overlay target.
   *
   * Calculates the position and size of the overlay based on the bounding rectangles of the
   * Quill container and the overlay target element. Updates the overlay's style to match
   * the target's position and dimensions, ensuring it is correctly displayed over the selected blot.
   * Optionally logs debug information if the `debug` option is enabled.
   *
   * @private
   */
  private _repositionOverlay = (): void => {
    if (this.currentSpec) {
      const overlayTarget = this.currentSpec.getOverlayElement();
      if (overlayTarget) {
        const containerRect: DOMRect = this.quill.container.getBoundingClientRect();
        const specRect: DOMRect = overlayTarget.getBoundingClientRect();
        const overlayRect: CssRectPx = {
          left: `${specRect.left - containerRect.left - 1 + this.quill.container.scrollLeft}px`,
          top: `${specRect.top - containerRect.top + this.quill.container.scrollTop}px`,
          width: `${specRect.width}px`,
          height: `${specRect.height}px`,
        };
        Object.assign(this.overlay.style, {
          display: 'block',
          ...overlayRect
        });
        if (this.options.debug)
          console.debug('Blotformatter _repositionOverlay', 'specRect:', specRect, 'overlayRect:', overlayRect);
      }
    }
  }

  /**
   * Sets the CSS `user-select` property (and its vendor-prefixed variants) to the specified value
   * on both the Quill editor root element and the document's root element.
   *
   * This method is typically used to enable or disable text selection within the editor and the page,
   * which can be useful during formatting operations to prevent unwanted user interactions.
   *
   * @param value - The value to set for the `user-select` property (e.g., `'none'`, `'auto'`).
   */
  private _setUserSelect = (value: string): void => {
    const props: string[] = [
      'userSelect',
      'mozUserSelect',
      'webkitUserSelect',
      'msUserSelect',
    ];

    props.forEach((prop: string) => {
      // set on contenteditable document element and quill root
      this.quill.root.style.setProperty(prop, value);
      if (document.documentElement) {
        document.documentElement.style.setProperty(prop, value);
      }
    });
    if (this.options.debug) console.debug('BlotFormatter _setUserSelect', value);
  }

  /**
   * Handles the `pointerdown` event on the document to determine whether the blot formatter overlay should be dismissed.
   *
   * If the pointer event target is outside the Quill editor, not within a blot formatter modal,
   * and not a proxy image used by the blot formatter, the overlay is hidden.
   *
   * @param event - The pointer event triggered by user interaction.
   */
  private _onDocumentPointerDown = (event: PointerEvent) => {
    // if clicked outside of quill editor and not a blot formatter modal or iframe proxy image, dismiss overlay 
    const target = event.target as HTMLElement;
    if (!(
      this.quill.root.parentNode.contains(target) ||
      target.closest('[data-blot-formatter-modal]') ||
      target.classList.contains('blot-formatter__proxy-image')
    )) {
      this.hide(event);
    }
  }

  /**
   * Handles pointer click events on the editor.
   * 
   * If debugging is enabled in the options, logs the click event to the console.
   * Then, hides the formatter UI in response to the click event.
   *
   * @param event - The pointer event triggered by the user's click.
   */
  private _onClick = (event: PointerEvent) => {
    if (this.options.debug) console.debug('BlotFormatter _onClick', event);
    this.hide(event);
  }

  /**
   * Handles the wheel event by scrolling the Quill editor's root element.
   * This method is intended to be used when the overlay or proxy receives a wheel event,
   * ensuring that the scroll action is passed through to the underlying Quill editor.
   *
   * @param event - The wheel event containing scroll delta values.
   *
   * @remarks
   * If the `debug` option is enabled, this method logs the scroll delta values to the console.
   */
  _passWheelEventThrough = (event: WheelEvent) => {
    // scroll the quill root element when overlay or proxy wheel scrolled
    this.quill.root.scrollLeft += event.deltaX;
    this.quill.root.scrollTop += event.deltaY;
    if (this.options.debug)
      console.debug(`BlotFormatter scrolling Quill root x: ${event.deltaX}, y: ${event.deltaY}`);
  };

  /**
   * Handles the touch start event for scrolling interactions.
   * Records the initial X and Y positions of the first touch point.
   * Optionally logs debug information if enabled in options.
   *
   * @param event - The touch event triggered when the user starts touching the screen.
   */
  _onTouchScrollStart = (event: TouchEvent) => {
    // Record the initial touch positions
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this._startX = touch.clientX;
      this._startY = touch.clientY;
      if (this.options.debug)
        console.debug('BlotFormatter _onTouchScrollStart', `X: ${this._startX}, Y: ${this._startY}`);
    }
  };

  /**
   * Handles touch move events to enable custom scrolling behavior within the Quill editor root element.
   * 
   * This method allows for both vertical and horizontal scrolling using touch gestures,
   * and prevents default browser scrolling when appropriate to provide a smoother, controlled experience.
   * It updates the scroll position of the editor root based on the movement of the touch point,
   * and ensures scrolling does not exceed the bounds of the content.
   * 
   * @param event - The touch event triggered by the user's finger movement.
   * 
   * @remarks
   * - Only processes single-touch events.
   * - Prevents default scrolling if the editor can be scrolled further in the direction of the gesture.
   * - Updates the starting touch coordinates after each move to track incremental movement.
   * - Logs debug information if the `debug` option is enabled.
   */
  _onTouchScrollMove = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const deltaX = this._startX - touch.clientX;
      const deltaY = this._startY - touch.clientY;

      // Early return if minimal movement
      if (Math.abs(deltaX) < 2 && Math.abs(deltaY) < 2) return;

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
      this._startX = touch.clientX;
      this._startY = touch.clientY;
      if (this.options.debug)
        console.debug('BlotFormatter touch scroll end', `X: ${this._startX}, Y: ${this._startY}`);
    }
  };

  /**
   * Registers custom Quill blots based on the provided options.
   *
   * - If `options.image.registerImageTitleBlot` is enabled, registers a custom Image blot
   *   that supports a title attribute.
   * - If `options.video.registerCustomVideoBlot` is enabled, registers a custom Video blot
   *   with responsive behavior and sets its default aspect ratio from the options.
   *
   * Debug information is logged to the console if `options.debug` is true.
   *
   * @private
   */
  private _registerCustomBlots = (): void => {
    // register image bot with title attribute support
    if (this.options.image.registerImageTitleBlot) {
      if (this.options.debug) console.debug('Registering custom Image blot', Image);
      Quill.register(Image, true);
    }
    // register custom video blot with initial width 100% & aspect ratio from options
    if (this.options.video.registerCustomVideoBlot) {
      if (this.options.debug) {
        console.debug('Registering custom Video blot', VideoResponsive);
        console.debug('Setting default aspect ratio for Video blot', this.options.video.defaultAspectRatio);
      }
      // set default aspect ratio for video responsive blot
      VideoResponsive.aspectRatio = this.options.video.defaultAspectRatio;
      Quill.register(VideoResponsive, true);
    }
  }

  /**
   * Registers custom keyboard bindings to address specific Quill editor issues and enhance user experience.
   *
   * - Adds a Backspace key binding to fix Quill bug #4364, ensuring proper deletion behavior for embedded videos (e.g., iframes).
   *   This is enabled if `options.video.registerBackspaceFix` is true.
   * - Adds an ArrowRight key binding to fix cursor navigation issues when moving past images,
   *   ensuring the cursor does not get stuck or hidden at the image location.
   *   This is enabled if `options.image.registerArrowRightFix` is true.
   *
   * Both bindings are conditionally registered based on the provided options.
   * Debug information is logged to the console if `options.debug` is enabled.
   *
   * @private
   */
  private _keyboardBindings = (): void => {
    // add backspace keyboard bindings
    // patch that fixes Quill bug #4364 (https://github.com/slab/quill/issues/4364)
    if (this.options.video.registerBackspaceFix) {
      if (!this.quill.keyboard.bindings.Backspace) {
        this.quill.keyboard.bindings.Backspace = []
      }
      const backspaceRule = {
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
      }
      this.quill.keyboard.bindings.Backspace.unshift(backspaceRule);
      if (this.options.debug)
        console.debug('BlotFormatter added Backspace keyboard binding', backspaceRule);
    }

    // handles moving the cursor past the image when format set
    // without this, cursor stops and stays hidden at the image location
    if (this.options.image.registerArrowRightFix) {
      if (!this.quill.keyboard.bindings.ArrowRight) {
        this.quill.keyboard.bindings.ArrowRight = []
      }
      const arrowRightFixRule = {
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
      };
      this.quill.keyboard.bindings.ArrowRight.unshift(arrowRightFixRule);
      if (this.options.debug)
        console.debug('BlotFormatter added ArrowRightFix keyboard binding', arrowRightFixRule);
    }
  }

  /**
   * Determines whether the resizing of the target element should use relative sizing (percentages)
   * or absolute sizing (pixels), based on the current configuration and the element's width attribute.
   *
   * @param targetElement - The HTML element whose sizing mode is being determined.
   * @returns `true` if relative sizing should be used, `false` otherwise.
   *
   * The method checks the `useRelativeSize` option and, if `allowResizeModeChange` is enabled,
   * inspects the element's `width` attribute to decide whether to use relative or absolute sizing.
   * If debugging is enabled, logs the decision to the console.
   */
  _useRelative = (targetElement: HTMLElement): boolean => {
    let _useRelative: boolean = this.options.resize.useRelativeSize;
    if (this.options.resize.allowResizeModeChange) {
      // if no width set, use useRelativeSize by default else respect existing type
      const width: string | null = targetElement.getAttribute('width');
      if (!width) {
        _useRelative = this.options.resize.useRelativeSize;
      } else {
        _useRelative = width.endsWith('%');
      }
    }
    if (this.options.debug) {
      console.debug('BlotFormatter _useRelative', _useRelative, 'for element', targetElement);
    }
    return _useRelative;
  }

  /**
   * Determines the relative position of a pointer event with respect to the overlay element.
   *
   * @param event - The pointer event to evaluate.
   * @returns The position of the pointer relative to the overlay, as a `PointerPosition` enum value.
   *
   * The possible return values are:
   * - `PointerPosition.ABOVE` if the pointer is above the overlay.
   * - `PointerPosition.BELOW` if the pointer is below the overlay.
   * - `PointerPosition.LEFT` if the pointer is to the left of the overlay.
   * - `PointerPosition.RIGHT` if the pointer is to the right of the overlay.
   * - `PointerPosition.INSIDE` if the pointer is inside the overlay.
   *
   * If the `debug` option is enabled, logs the determined position and event to the console.
   */
  private _getClickPosition = (event: PointerEvent): PointerPosition => {
    const target = this.overlay;
    const rect = target.getBoundingClientRect();
    let position: PointerPosition;
    if (event.clientY < rect.top) {
      position = PointerPosition.ABOVE;
    } else if (event.clientY > rect.bottom) {
      position = PointerPosition.BELOW;
    } else if (event.clientX < rect.left) {
      position = PointerPosition.LEFT;
    } else if (event.clientX > rect.right) {
      position = PointerPosition.RIGHT;
    } else {
      position = PointerPosition.INSIDE;
    }
    if (this.options.debug) {
      console.debug('BlotFormatter _getClickPosition', position, 'for event', event);
    }
    return position;
  }
}
