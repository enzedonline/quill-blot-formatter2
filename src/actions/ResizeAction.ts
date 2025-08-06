import Action from './Action';
import BlotFormatter from '../BlotFormatter';
import ToolbarButton from './toolbar/ToolbarButton';

interface HandleStyle {
  width?: string;
  height?: string;
}

/**
 * Provides interactive resizing functionality for elements within a Quill editor overlay.
 * 
 * `ResizeAction` manages the creation, positioning, and behavior of resize handles for supported elements
 * (such as images, videos, and iframes), allowing users to adjust their size via mouse or touch gestures.
 * It supports both absolute (pixel-based) and relative (percentage-based) sizing modes, aspect ratio maintenance,
 * and optional oversize protection for images. The class also integrates with a toolbar for toggling resize modes,
 * displays live size information, and ensures proper cleanup of DOM elements and event listeners.
 * 
 * @remarks
 * - Handles mouse and touch events for resizing, including pinch-to-resize gestures.
 * - Maintains aspect ratio and supports custom aspect ratios for unclickable elements.
 * - Integrates with a toolbar for resize mode switching.
 * - Displays live size info and manages fade-out transitions.
 * - Supports oversize protection for images and SVG detection.
 * - Ensures proper cleanup to prevent memory leaks.
 * 
 * @example
 * ```typescript
 * const resizeAction = new ResizeAction(formatter);
 * resizeAction.onCreate();
 * // ... user interacts with overlay ...
 * resizeAction.onDestroy();
 * ```
 */
export default class ResizeAction extends Action {
  private _topLeftHandle: HTMLElement;
  private _topRightHandle: HTMLElement;
  private _bottomRightHandle: HTMLElement;
  private _bottomLeftHandle: HTMLElement;
  private _dragHandle: HTMLElement | null | undefined = null;
  private _dragStartX: number = 0;
  private _dragCursorStyle: HTMLElement;
  private _preDragWidth: number = 0;
  private _pinchStartDistance: number = 0;
  private _calculatedAspectRatio: number = 0;
  private _computedAspectRatio: string | undefined = undefined;
  private _target: HTMLElement | null | undefined;
  private _editorStyle: CSSStyleDeclaration | undefined;
  private _editorWidth: number = 0;
  private _useRelativeSize: boolean;
  private _resizeModeButton: ToolbarButton | null = null;
  private _isUnclickable: boolean = false;
  private _hasResized: boolean = false;
  private _formattedWidth: string = '';
  private _sizeInfoTimerId: ReturnType<typeof setTimeout> | null = null;
  private _isImage: boolean = false;
  private _isSVG: boolean = false;
  private _naturalWidth: number | undefined = undefined;

  constructor(formatter: BlotFormatter) {
    super(formatter);
    this._topLeftHandle = this._createHandle('top-left', 'nwse-resize');
    this._topRightHandle = this._createHandle('top-right', 'nesw-resize');
    this._bottomRightHandle = this._createHandle('bottom-right', 'nwse-resize');
    this._bottomLeftHandle = this._createHandle('bottom-left', 'nesw-resize');
    this._dragCursorStyle = document.createElement('style');
    this._useRelativeSize = this.formatter.options.resize.useRelativeSize;
    if (formatter.options.resize.allowResizeModeChange) {
      this._resizeModeButton = this._createResizeModeButton();
      this.toolbarButtons = [
        this._resizeModeButton
      ]
    }
  }

  /**
   * Initializes the resize action by setting up the target element, determining its type,
   * and appending resize handles to the overlay. Also attaches mouse and touch event listeners
   * to the overlay for handling user interactions. Finally, positions the handles according to
   * the specified style options.
   *
   * @remarks
   * This method should be called when the resize action is created to ensure all necessary
   * DOM elements and event listeners are properly initialized.
   */
  onCreate = (): void => {
    this._target = this.formatter.currentSpec?.getTargetElement();
    this._isUnclickable = this.formatter.currentSpec?.isUnclickable || false;
    this._isImage = this._target instanceof HTMLImageElement;
    if (this._isImage) {
      this._isSVG = this._isSvgImage();
    }

    this.formatter.overlay.append(
      this._topLeftHandle, this._topRightHandle,
      this._bottomRightHandle, this._bottomLeftHandle
    );
    this.formatter.overlay.addEventListener('mousedown', this._onOverlayMouseDown)
    this.formatter.overlay.addEventListener('mouseup', this._onOverlayMouseUp)

    const passiveFalse = { passive: false } as EventListenerOptions;
    this.formatter.overlay.addEventListener('touchstart', this._onOverlayTouchStart, passiveFalse);
    this.formatter.overlay.addEventListener('touchmove', this._onOverlayTouchMove, passiveFalse);
    this.formatter.overlay.addEventListener('touchend', this._onOverlayTouchEnd, passiveFalse);

    const handleStyle: HandleStyle = this.formatter.options.resize.handleStyle || {};
    this._repositionHandles(handleStyle);
    if (this.debug) {
      console.debug('ResizeAction created with target:', this._target, 'isUnclickable:', this._isUnclickable);
    }
  }

  /**
   * Cleans up resources and event listeners associated with the resize action.
   * 
   * This method resets internal state, removes resize handles from the overlay,
   * detaches mouse and touch event listeners, and triggers an update on the formatter.
   * 
   * Should be called when the resize action is no longer needed to prevent memory leaks
   * and unintended behavior.
   */
  onDestroy = (): void => {
    this._target = null;
    this._isUnclickable = false;
    this._isImage = false;
    this._naturalWidth = undefined;
    this._isSVG = false;
    this._setCursor('');
    [
      this._topLeftHandle, this._topRightHandle, 
      this._bottomRightHandle, this._bottomLeftHandle
    ].forEach(handle => { handle.remove(); });
    this.formatter.overlay.removeEventListener('mousedown', this._onOverlayMouseDown);
    this.formatter.overlay.removeEventListener('mouseup', this._onOverlayMouseUp);

    const passiveFalse = { passive: false } as EventListenerOptions;
    this.formatter.overlay.removeEventListener('touchstart', this._onOverlayTouchStart, passiveFalse);
    this.formatter.overlay.removeEventListener('touchmove', this._onOverlayTouchMove, passiveFalse);
    this.formatter.overlay.removeEventListener('touchend', this._onOverlayTouchEnd, passiveFalse);
    this.formatter.update();
  }

  /**
   * Creates a resize handle element for the specified position with the given cursor style.
   *
   * The handle is styled using the class name and optional style provided in the formatter's options.
   * It also sets a `data-position` attribute and attaches a pointer down event listener.
   *
   * @param position - The position identifier for the handle (e.g., 'top-left', 'bottom-right').
   * @param cursor - The CSS cursor style to apply when hovering over the handle.
   * @returns The created HTMLElement representing the resize handle.
   */
  private _createHandle = (position: string, cursor: string): HTMLElement => {
    // create resize handles
    const box = document.createElement('div');
    box.classList.add(this.formatter.options.resize.handleClassName);
    box.setAttribute('data-position', position);
    box.style.cursor = cursor;
    if (this.formatter.options.resize.handleStyle) {
      Object.assign(box.style, this.formatter.options.resize.handleStyle);
    }
    box.addEventListener('pointerdown', this._onHandlePointerDown);
    return box;
  }

  /**
   * Repositions the resize handles around an element based on the provided handle style.
   *
   * @param handleStyle - Optional style object containing width and height properties for the handles.
   *                      If provided, the handles are offset by half their width and height to center them.
   *                      If not provided, default offsets of '0px' are used.
   *
   * The method updates the `left`, `right`, `top`, and `bottom` CSS properties of the four handles
   * (`_topLeftHandle`, `_topRightHandle`, `_bottomRightHandle`, `_bottomLeftHandle`) to ensure they are
   * correctly positioned relative to the element being resized.
   */
  private _repositionHandles = (handleStyle?: HandleStyle): void => {
    // Cache offset calculations
    const handleXOffset = handleStyle?.width ? `${-parseFloat(handleStyle.width) / 2}px` : '0px';
    const handleYOffset = handleStyle?.height ? `${-parseFloat(handleStyle.height) / 2}px` : '0px';

    // Use direct property assignment instead of Object.assign for better performance
    const { style: topLeftStyle } = this._topLeftHandle;
    topLeftStyle.left = handleXOffset;
    topLeftStyle.top = handleYOffset;

    const { style: topRightStyle } = this._topRightHandle;
    topRightStyle.right = handleXOffset;
    topRightStyle.top = handleYOffset;

    const { style: bottomRightStyle } = this._bottomRightHandle;
    bottomRightStyle.right = handleXOffset;
    bottomRightStyle.bottom = handleYOffset;

    const { style: bottomLeftStyle } = this._bottomLeftHandle;
    bottomLeftStyle.left = handleXOffset;
    bottomLeftStyle.bottom = handleYOffset;
  }

  /**
   * Sets the cursor style for the document body and all its children.
   * When a non-empty value is provided, it applies the specified cursor style
   * globally by injecting a style element into the document head.
   * When an empty value is provided, it removes the previously injected style element,
   * reverting the cursor to its default behavior.
   *
   * @param value - The CSS cursor value to apply (e.g., 'pointer', 'col-resize').
   */
  private _setCursor = (value: string): void => {
    if (!document.body) {
      console.warn('ResizeAction: Cannot set cursor - document.body is null');
      return;
    }

    try {
      if (value) {
        this._dragCursorStyle.innerHTML = `body, body * { cursor: ${value} !important; }`;
        if (!document.head.contains(this._dragCursorStyle)) {
          document.head.appendChild(this._dragCursorStyle);
        }
      } else {
        if (document.head.contains(this._dragCursorStyle)) {
          document.head.removeChild(this._dragCursorStyle);
        }
      }
    } catch (error) {
      console.error('ResizeAction: Error setting cursor style:', error);
    }
  }

  /**
   * Activates or deactivates the resize mode for the target element.
   * 
   * When activated, prepares the target for resizing by determining the resize mode (absolute or relative),
   * calculating editor and target dimensions, handling aspect ratio logic, and displaying size information.
   * When deactivated, applies the finalized width to the _target, updates toolbar button states, sets style attributes,
   * clears cached natural width, updates the formatter, and hides the size info box.
   * 
   * @param activate - If `true`, activates resize mode; if `false`, finalizes and deactivates resize mode.
   */
  private _resizeMode = (activate: boolean): void => {
    if (activate) {
      // activate resize mode, show size info
      this._hasResized = false;
      this._formattedWidth = '';
      if (!!this._target) {
        // determine resize mode to use (absolute/relative)
        this._useRelativeSize = this.formatter._useRelative(this._target);
        // get inner editor width to calculate % values
        this._editorStyle = getComputedStyle(this.formatter.quill.root);
        this._editorWidth = this.formatter.quill.root.clientWidth -
          parseFloat(this._editorStyle.paddingLeft) -
          parseFloat(this._editorStyle.paddingRight);

        const rect = this._target.getBoundingClientRect();
        // prevent division by zero in the case that rect.height is 0 for some reason
        if (rect.height === undefined || rect.height === 0) {
          rect.height = this._target.clientHeight + 1;
        }
        this._preDragWidth = rect.width;
        this._computedAspectRatio = getComputedStyle(this._target).aspectRatio || 'auto'
        this._calculatedAspectRatio = rect.width / rect.height;

        if (this._useRelativeSize) {
          if (this._isUnclickable) {
            // strip height for relative iframe sizing, rely on aspect-ratio instead
            if (this._computedAspectRatio === 'auto') {
              // relative size on iframe requires aspect-ratio to be set - use default from options
              this._target.style.aspectRatio = this.formatter.options.video.defaultAspectRatio;
              console.warn(
                `No iframe aspect-ratio set. Set an aspect ratio either via custom blot or css.\n` +
                `Using temporary aspect ratio "${this.formatter.options.video.defaultAspectRatio}"`
              );
            }
          }
        } else {
          if (this._isUnclickable && this._computedAspectRatio !== 'auto') {
            // if aspect-ratio set via blot or css, try to use that ratio for new height instead
            const ratio = this._computedAspectRatio.match(/(\d+)\s*\/\s*(\d+)/);
            if (ratio) {
              try {
                this._calculatedAspectRatio = parseFloat(ratio[1]) / parseFloat(ratio[2]);
              } catch { }
            }
          }
        }
        // get natural width if oversize protection on and resize mode is absolute (not relative) - excludes SVG
        if (this._isImage && !this._useRelativeSize && !this._isSVG && this.formatter.options.resize.imageOversizeProtection) {
          this._naturalWidth = (this._target as HTMLImageElement).naturalWidth;
        }
        // show size info box
        this._showSizeInfo(true, rect.width, rect.height);
        if (this.debug) {
          console.debug('ResizeAction resize mode activated:', {
            target: this._target,
            useRelativeSize: this._useRelativeSize,
            editorWidth: this._editorWidth,
            preDragWidth: this._preDragWidth,
            aspectRatio: this._calculatedAspectRatio,
            computedAspectRatio: this._computedAspectRatio
          });
        }
      }
    } else {
      if (this._target && this._hasResized) {
        // round dimensions to whole numbers
        let width: string = this._roundDimension(this._formattedWidth);
        this._target.setAttribute('width', width);
        // set resize mode button selected status if inuded in toolbar
        if (this.formatter.toolbar.buttons['resizeMode']) {
          this.formatter.toolbar.buttons['resizeMode'].selected = this.isRelative;
        }
        // set --resize-width style attribute and data-relative-size attribute
        if (this._isUnclickable) {
          this._target.style.setProperty('--resize-width', `${width}`);
          this._target.dataset.relativeSize = `${this.isRelative}`
        } else {
          if (this.isAligned && this._target.parentElement) {
            this._target.parentElement.style.setProperty('--resize-width', `${width}`);
            this._target.parentElement.dataset.relativeSize = `${this.isRelative}`
          }
        }
        if (this.debug) {
          console.debug('ResizeAction resize mode deactivated:', {
            target: this._target,
            width: width,
            isRelative: this.isRelative,
            isAligned: this.isAligned
          });
        }
      }
      // clear any cached image natural width
      this._naturalWidth = undefined;

      this.formatter.update();
      // fade out size info box
      this._showSizeInfo(false);
    }
  };

  /**
   * Handles the pointer down event on a resize handle.
   * 
   * Initiates the resize mode, sets up the drag handle, and stores the starting X position.
   * Adds event listeners for pointer move and pointer up to enable drag behavior.
   * 
   * @param event - The pointer event triggered when the user presses down on a resize handle.
   */
  private _onHandlePointerDown = (event: PointerEvent): void => {
    this._resizeMode(true);
    if (event.target instanceof HTMLElement && !!this._target) {
      this._dragHandle = event.target;
      this._setCursor(this._dragHandle.style.cursor);
      this._dragStartX = event.clientX;
      // enable drag behaviour until pointer up event
      document.addEventListener('pointermove', this._onHandleDrag);
      document.addEventListener('pointerup', this._onHandlePointerUp);
    }
  };

  /**
   * Handles the drag event for a resize handle, updating the target element's width.
   *
   * Calculates the new width based on the pointer's movement and the initial drag position.
   * Ensures the new width stays within the editor's bounds and does not shrink below the minimum allowed width.
   * Applies the new width to both the target element and its overlay.
   *
   * @param event - The pointer event triggered during dragging.
   */
  private _onHandleDrag = (event: PointerEvent): void => {
    // If no target element or drag handle is set, exit early
    if (!this._target || !this._dragHandle) return;

    // Mark that a resize has occurred
    this._hasResized = true;

    // Calculate horizontal movement since drag started
    const deltaX = event.clientX - this._dragStartX;

    // Determine if the dragged handle is on the left side
    const isLeftHandle =
      this._dragHandle === this._topLeftHandle ||
      this._dragHandle === this._bottomLeftHandle;

    // Calculate new width: subtract delta for left handles, add for right handles
    const newWidth = Math.round(
      isLeftHandle ? this._preDragWidth - deltaX : this._preDragWidth + deltaX
    );

    // Constrain the new width between minimum and editor width
    const constrainedWidth = Math.max(
      Math.min(newWidth, this._editorWidth),
      this.formatter.options.resize.minimumWidthPx
    );

    // Resize the target element to the constrained width
    this._resizeTarget(constrainedWidth);
  };

  /**
   * Handles the pointer up event on the resize handle.
   * 
   * This method disables resize mode, resets the cursor style,
   * and removes the event listeners for pointer movement and pointer up events.
   * It is typically called when the user releases the pointer after resizing.
   */
  private _onHandlePointerUp = (): void => {
    // disable resize mode, reset cursor, tidy up
    this._setCursor('');
    this._resizeMode(false);
    // remove resize event listeners
    document.removeEventListener('pointermove', this._onHandleDrag);
    document.removeEventListener('pointerup', this._onHandlePointerUp);
  };

  /**
   * Handles the touch start event on the overlay element.
   * If the overlay itself is the _target, enables resize mode.
   * When two fingers touch the target element, prevents default scrolling,
   * calculates the initial distance between the fingers for pinch-to-resize,
   * and stores the initial width of the target element.
   *
   * @param event - The touch event triggered on the overlay.
   */
  private _onOverlayTouchStart = (event: TouchEvent): void => {
    if (event.target === this.formatter.overlay) {
      this._resizeMode(true);
      if (!!this._target && event.touches.length === 2) {
        event.preventDefault(); // Prevent default touch behavior like scrolling
        // Calculate the initial distance between two fingers
        this._pinchStartDistance = this._calculateDistance(event.touches[0], event.touches[1]);
        // Get the initial width of the element
        this._preDragWidth = this._target.clientWidth;
      }
    }
  }

  /**
   * Handles touch move events on the overlay for resizing the target element via pinch gestures.
   *
   * When two fingers are detected on the overlay, calculates the distance between them to determine
   * the scale factor for resizing. The new width is constrained between a minimum of 10px and the
   * maximum editor width. Prevents default touch behavior such as scrolling during the gesture.
   *
   * @param event - The touch event triggered by user interaction.
   */
  private _onOverlayTouchMove = (event: TouchEvent): void => {
    if (event.target === this.formatter.overlay) {
      if (!!this._target && event.touches.length === 2 && this._pinchStartDistance !== null && this._preDragWidth !== null) {
        event.preventDefault(); // Prevent default touch behaviour like scrolling
        if (this._target) {
          this._hasResized = true;
          // Calculate the current distance between two fingers
          const currentDistance = this._calculateDistance(event.touches[0], event.touches[1]);
          // Calculate the scale factor & new width
          const scale = currentDistance / this._pinchStartDistance;
          let newWidth: number = Math.round(this._preDragWidth * scale);
          // ensure width does not grow beyond editor width or shrink below 10px
          newWidth = Math.max(Math.min(newWidth, this._editorWidth), 10);
          // resize target + overlay
          this._resizeTarget(newWidth);
        }
      }
    }
  }

  /**
   * Handles the touch end event on the overlay element.
   * If the touch event's target is the formatter's overlay, it disables resize mode.
   *
   * @param event - The touch event triggered on the overlay.
   */
  private _onOverlayTouchEnd = (event: TouchEvent): void => {
    if (event.target === this.formatter.overlay) {
      this._resizeMode(false);
    }
  }

  /**
   * Handles the mouse down event on the overlay element.
   * If the event target is the formatter's overlay, enables resize mode.
   *
   * @param event - The mouse event triggered by the user interaction.
   */
  private _onOverlayMouseDown = (event: MouseEvent): void => {
    if (event.target === this.formatter.overlay) {
      this._resizeMode(true);
    }
  }

  /**
   * Handles the mouse up event on the overlay element.
   * If the event target is the formatter's overlay, it disables resize mode.
   *
   * @param event - The mouse event triggered when the user releases the mouse button.
   */
  private _onOverlayMouseUp = (event: MouseEvent): void => {
    if (event.target === this.formatter.overlay) {
      this._resizeMode(false);
    }
  }

  /**
   * Resizes the target element to the specified width, maintaining aspect ratio and updating related UI elements.
   *
   * - Limits the new width if image oversize protection is enabled.
   * - Calculates the new height based on the aspect ratio.
   * - Updates the size information display.
   * - Sets the new width and height attributes on the target element.
   * - Applies the width style property to the wrapper if the image is aligned.
   * - Handles special cases for unclickable elements and absolute sizing.
   * - Triggers an update to the overlay position.
   *
   * @param newWidth - The desired new width for the target element.
   */
  private _resizeTarget = (newWidth: number): void => {
    if (!this._target) {
      console.warn('ResizeAction: Cannot resize - target element is null');
      return;
    }

    try {
      // if image oversize protection on, limit newWidth
      // this._naturalWidth only has value when target is image and protextion is on (set in _resizeMode)
      newWidth = Math.min(this._naturalWidth ?? Infinity, newWidth);
      // update size info display
      const newHeight: number = newWidth / this._calculatedAspectRatio;
      this._updateSizeInfo(newWidth, newHeight);
      // set new dimensions on _target
      if (this.formatter._useRelative(this._target)) {
        this._formattedWidth = `${100 * newWidth / this._editorWidth}%`;
      } else {
        this._formattedWidth = `${newWidth}px`;
      }
      this._target.setAttribute('width', this._formattedWidth);
      this._target.setAttribute('height', 'auto');

      // update width style property to wrapper if image and has imageAlign format
      // width needed to size wrapper correctly via css
      // set fixed height to unclickable if using absolute size mode and no aspect ratio given
      if (this._isUnclickable) {
        if (!this._useRelativeSize && this._computedAspectRatio === 'auto') {
          this._target.setAttribute('height', `${(newWidth / this._calculatedAspectRatio) | 0}px`)
        }
        this._target.style.setProperty('--resize-width', this._formattedWidth);
      } else if (!this._isUnclickable && this.isAligned && !!this._target.parentElement) {
        this._target.parentElement.style.setProperty('--resize-width', this._formattedWidth);
      }
      // updates overlay position
      this.formatter.update();
    } catch (error) {
      console.error('ResizeAction: Error resizing target element:', error);
    }
  }

  /**
   * Shows or hides the size information box for the formatter.
   *
   * When `show` is `true`, cancels any existing size info timer, updates the size info
   * if `width` and `height` are provided, and makes the size info box visible.
   * When `show` is `false`, fades out and closes the size info box.
   *
   * @param show - Whether to show (`true`) or hide (`false`) the size info box.
   * @param width - The width to display in the size info box (optional).
   * @param height - The height to display in the size info box (optional).
   */
  private _showSizeInfo = (show: boolean, width: number | null = null, height: number | null = null): void => {
    if (show) {
      this._cancelSizeInfoTimer();
      if (width !== null && height !== null) {
        this._updateSizeInfo(width, height);
      }
      this.formatter.sizeInfo.style.transition = '';
      this.formatter.sizeInfo.style.opacity = '1';
    }
    else {
      // fade out size info box
      this._closeSizeInfo();
    }
  }

  /**
   * Updates the size information display for the selected blot.
   *
   * - Rounds the provided width and height to the nearest integer.
   * - Formats the size string as "width x height px".
   * - If the size is relative, displays the percentage relative to the editor width,
   *   with the actual pixel size in brackets.
   * - If the size is absolute and the blot has not been resized:
   *   - If the target element has a `width` attribute that differs from the displayed width,
   *     shows the attribute value and its calculated height, with the displayed size in brackets.
   *   - If the target is an image and its natural dimensions differ from the displayed size,
   *     shows the natural dimensions with the displayed size in brackets.
   * - Updates the `sizeInfo` element in the formatter with the computed size string.
   *
   * @param width - The displayed width of the blot.
   * @param height - The displayed height of the blot.
   */
  private _updateSizeInfo = (width: number, height: number): void => {
    // Round width and height to nearest integer for display
    const roundedWidth = Math.round(width);
    const roundedHeight = Math.round(height);
    // Default size string in "width x height px" format
    let size = `${roundedWidth} x ${roundedHeight}px`;

    if (this.isRelative) {
      // If using relative sizing, calculate percentage of editor width
      const percentage = Math.round(100 * width / this._editorWidth);
      // Show percentage and actual pixel size in brackets
      size = `${percentage}% (${size})`;
    } else if (!this._hasResized && this._target) {
      // If not resized yet and target exists, check for set width attribute
      const setWidth = this._target.getAttribute('width');
      if (setWidth) {
        // If set width differs from current width, show set width and calculated height
        const setWidthNum = parseFloat(setWidth);
        if (setWidthNum !== width) {
          const aspectRatio = width / height;
          const calculatedHeight = Math.round(setWidthNum / aspectRatio);
          size = `${setWidth} x ${calculatedHeight}px (${size})`;
        }
      } else if (this._target instanceof HTMLImageElement) {
        // For images, if natural width differs, show natural dimensions
        const { naturalWidth, naturalHeight } = this._target;
        if (naturalWidth !== width) {
          size = `${naturalWidth} x ${naturalHeight}px (${size})`;
        }
      }
    }

    // Update the formatter's size info element with the computed size string
    this.formatter.sizeInfo.innerText = size;
  }

  get isRelative(): boolean {
    return this._target?.getAttribute('width')?.endsWith('%') || false;
  }

  get isAligned(): boolean {
    if (this._target) {
      return this._target.hasAttribute('data-blot-align');
    } else {
      return false;
    }
  }

  /**
   * Creates a toolbar button for toggling the resize mode.
   *
   * The button is initialized with a unique identifier, a click handler, and toolbar options.
   * The `preselect` property is set to indicate whether the resize mode is currently relative.
   *
   * @returns {ToolbarButton} The configured resize mode toolbar button.
   */
  private _createResizeModeButton = (): ToolbarButton => {
    const button = new ToolbarButton(
      'resizeMode',
      this._onResizeModeClickHandler,
      this.formatter.options.toolbar,
    );
    button.preselect = () => {
      return this.isRelative;
    }
    return button
  }

  /**
   * Handles the click event for the resize mode control.
   * Stops the event from propagating further and swaps the resize mode.
   *
   * @param event - The event object triggered by the click.
   */
  private _onResizeModeClickHandler: EventListener = (event: Event): void => {
    event.stopImmediatePropagation();
    this._swapResizeMode(true);
  }

  /**
   * Swaps the resize mode of the target element between relative (percentage-based) and absolute (pixel-based) sizing.
   * Updates the _target's width and height attributes, as well as relevant CSS custom properties and data attributes,
   * depending on the current resize mode and alignment. Also updates the toolbar button state and optionally displays
   * size information.
   *
   * @param showInfo - If true, displays size information after resizing.
   */
  private _swapResizeMode = (showInfo: boolean = false): void => {
    if (this._target) {
      const rect: DOMRect = this._target.getBoundingClientRect();
      this._editorStyle = getComputedStyle(this.formatter.quill.root);
      this._editorWidth = this.formatter.quill.root.clientWidth -
        parseFloat(this._editorStyle.paddingLeft) -
        parseFloat(this._editorStyle.paddingRight);
      let newWidth: string;
      if (this.isRelative) {
        newWidth = `${Math.round(rect.width)}px`;
      } else {
        newWidth = `${Math.round(100 * rect.width / this._editorWidth)}%`;
      }
      this._target.setAttribute('width', `${newWidth}`);
      this._target.setAttribute('height', 'auto');
      if (this.formatter.currentSpec?.isUnclickable) {
        this._target.style.setProperty('--resize-width', `${newWidth}`);
        this._target.dataset.relativeSize = `${this.isRelative}`;
      } else {
        if (this.isAligned && this._target.parentElement) {
          this._target.parentElement.style.setProperty('--resize-width', `${newWidth}`);
          this._target.parentElement.dataset.relativeSize = `${this.isRelative}`;
        }
      }
      this.formatter.toolbar.buttons['resizeMode'].selected = this.isRelative;
      this.formatter.update();
      if (showInfo) {
        this._showSizeInfo(true, rect.width, rect.height);
        this._showSizeInfo(false);
      }
      if (this.debug) {
        console.debug('ResizeAction resize mode swapped:', {
          target: this._target,
          newWidth: newWidth,
          isRelative: this.isRelative,
          isAligned: this.isAligned
        });
      }
    }
  }

  /**
   * Initiates a timer to fade out the size information element after a delay.
   * Sets the opacity of the `sizeInfo` element to 0 with a transition effect after 1 second.
   * Stores the timer ID in `_sizeInfoTimerId` for potential future reference or cancellation.
   */
  private _closeSizeInfo = (): void => {
    this._sizeInfoTimerId = setTimeout(() => {
      this.formatter.sizeInfo.style.transition = 'opacity 1s';
      this.formatter.sizeInfo.style.opacity = '0';
    }, 1000);
  }

  /**
   * Cancels the active size info timer, if one exists.
   * Clears the timeout associated with `_sizeInfoTimerId` and resets the timer ID to `null`.
   */
  private _cancelSizeInfoTimer = (): void => {
    if (this._sizeInfoTimerId !== null) {
      clearTimeout(this._sizeInfoTimerId);
      this._sizeInfoTimerId = null;
    }
  }

  /**
   * Calculates the Euclidean distance between two touch points.
   *
   * @param touch1 - The first touch point.
   * @param touch2 - The second touch point.
   * @returns The distance in pixels between the two touch points.
   */
  private _calculateDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Rounds the numeric part of a dimension string to the nearest integer, preserving any prefix or suffix.
   *
   * Examples:
   * - '-$34.565c' becomes '-$35c'
   * - '21.244px' becomes '21px'
   *
   * @param dim - The dimension string containing a number and optional prefix/suffix.
   * @returns The dimension string with the numeric part rounded to the nearest integer.
   */
  private _roundDimension = (dim: string): string => {
    // round string number with units (prefix and/or suffix): '-$34.565c' -> '-$35c', '21.244px' -> '24px'
    return dim.replace(/([^0-9.-]*)(-?[\d.]+)(.*)/, (_, prefix, num, suffix) => `${prefix}${Math.round(Number(num))}${suffix}`);
  }

  /**
   * Determines whether the target image is an SVG image.
   *
   * Checks if the target is an HTMLImageElement and then verifies:
   * - If the image source is a data URL, it checks for the 'image/svg+xml' MIME type.
   * - Otherwise, it checks if the image source URL ends with '.svg'.
   *
   * @returns {boolean} True if the target image is an SVG, otherwise false.
   */
  private _isSvgImage = (): boolean => {
    if (this._target instanceof HTMLImageElement) {
      if (this._target.src.startsWith('data:image/')) {
        return this._target.src.includes('image/svg+xml');
      }
      return this._target.src.endsWith('.svg');
    }
    return false;
  }
}
