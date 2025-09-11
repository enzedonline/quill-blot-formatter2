import { default as default_2 } from 'quill';

/**
 * Represents a base class for actions used within the BlotFormatter.
 *
 * This class provides a structure for actions that can be performed by the formatter,
 * including lifecycle hooks for creation, destruction, and updates. Subclasses should
 * override the lifecycle methods as needed.
 *
 * @remarks
 * - Each action holds a reference to the parent `BlotFormatter` instance.
 * - Actions can define their own toolbar buttons by populating the `toolbarButtons` array.
 * - Debug logging is available if the formatter's options enable it.
 *
 * @example
 * ```typescript
 * class CustomAction extends Action {
 *   onCreate = (): void => {
 *     // Custom initialization logic
 *   }
 *   onDestroy = (): void => {
 *     // Custom destruction logic
 *   }
 *   onUpdate = (): void => {
 *     // Custom update logic
 *   }
 * }
 * ```
 *
 * @public
 */
export declare class Action {
    formatter: BlotFormatter;
    toolbarButtons: ToolbarButton[];
    debug: boolean;
    constructor(formatter: BlotFormatter);
    /**
     * Called when the action is created.
     * Override this method to implement custom initialization logic.
     */
    onCreate: () => void;
    /**
     * Called when the action is being destroyed.
     * Override this method to implement custom cleanup logic.
     */
    onDestroy: () => void;
    /**
     * Called when the action should be updated.
     * Override this method to implement custom update logic.
     */
    onUpdate: () => void;
}

/**
 * Provides alignment actions for Quill editor blots, including creating, managing,
 * and handling alignment toolbar buttons. Integrates with a `DefaultAligner` to
 * apply, clear, and detect alignment on selected blots. Handles UI state for
 * alignment buttons and supports debug logging.
 *
 * @remarks
 * This class is intended to be used as part of a Quill blot formatter extension,
 * enabling users to align embedded content (such as images or videos) via a toolbar.
 *
 * @extends Action
 *
 * @example
 * ```typescript
 * const alignAction = new AlignAction(formatter);
 * alignAction.onCreate();
 * // ... user interacts with toolbar ...
 * alignAction.onDestroy();
 * ```
 */
export declare class AlignAction extends Action {
    aligner: DefaultAligner;
    alignButtons: Record<string, ToolbarButton>;
    constructor(formatter: BlotFormatter);
    /**
     * Creates alignment toolbar buttons for each available alignment option.
     *
     * Iterates over the alignments provided by the aligner and creates a `ToolbarButton`
     * for each alignment, storing them in the `alignButtons` map. If there is a currently
     * selected blot, it checks its alignment and preselects the corresponding button.
     * Optionally logs debug information about the created buttons and the current alignment.
     *
     * @private
     */
    private _createAlignmentButtons;
    /**
     * Clears the selection state of all alignment buttons.
     *
     * Iterates through all buttons in the `alignButtons` collection and sets their
     * `selected` property to `false`. If debugging is enabled, logs a message to the console.
     *
     * @private
     */
    private _clearButtons;
    /**
     * Handles click events on alignment toolbar buttons.
     *
     * This event handler determines which alignment action was triggered by the user,
     * retrieves the corresponding alignment configuration, and applies or clears the alignment
     * on the currently selected blot in the editor. It also updates the toolbar button states
     * and logs debug information if enabled.
     *
     * @param event - The click event triggered by the user on a toolbar button.
     */
    onClickHandler: EventListener;
    /**
     * Initializes the alignment action by creating alignment buttons and storing them in the toolbar.
     * If debug mode is enabled in the formatter options, logs the created alignment buttons to the console.
     *
     * @returns {void}
     */
    onCreate: () => void;
    /**
     * Cleans up resources used by the alignment action.
     *
     * This method resets the `alignButtons` object and clears the `toolbarButtons` array.
     * If debug mode is enabled in the formatter options, a debug message is logged to the console.
     *
     * @returns {void}
     */
    onDestroy: () => void;
}

/**
 * Interface for objects that handle alignment operations on blots.
 *
 * Implementations of this interface provide methods to retrieve available alignments,
 * check if a blot is aligned to a specific alignment, and clear alignment from a blot.
 */
declare interface Aligner {
    getAlignments(): Alignment[];
    isAligned(blot: Blot | null, alignment: Alignment): boolean;
    clear(blot: Blot | null): void;
}

/**
 * Represents an alignment action that can be applied to a Blot.
 *
 * @property name - The name of the alignment (e.g., "left", "center", "right").
 * @property apply - A function that applies the alignment to the given Blot instance.
 *                   If the provided Blot is null, the function should handle it gracefully.
 */
declare type Alignment = {
    name: string;
    apply: (blot: Blot | null) => void;
};

declare type AlignOptions = {
    allowAligning: boolean;
    alignments: string[];
};

declare interface AltTitleModal {
    element: HTMLDivElement;
    form: HTMLFormElement;
    altInput: HTMLTextAreaElement;
    titleInput: HTMLTextAreaElement;
    cancelButton: HTMLButtonElement;
}

declare type AltTitleModalOptions = {
    styles?: {
        modalBackground?: {
            [key: string]: any;
        } | null | undefined;
        modalContainer?: {
            [key: string]: any;
        } | null | undefined;
        label?: {
            [key: string]: any;
        } | null | undefined;
        textarea?: {
            [key: string]: any;
        } | null | undefined;
        submitButton?: {
            [key: string]: any;
        } | null | undefined;
        cancelButton?: {
            [key: string]: any;
        } | null | undefined;
    } | null | undefined;
    icons: {
        submitButton: string;
        cancelButton: string;
    };
    labels: {
        alt: string;
        title: string;
    };
};

export declare class AttributeAction extends Action {
    modal: AltTitleModal;
    targetElement: HTMLElement | null | undefined;
    currentBlot: Blot | null | undefined;
    constructor(formatter: BlotFormatter);
    /**
     * Initializes the target element and current blot for the action.
     * Retrieves the target element and blot from the current formatter specification.
     *
     * @remarks
     * This method should be called when the action is created to ensure
     * that the necessary references are set up for further processing.
     */
    onCreate: () => void;
    /**
     * Cleans up resources when the action is destroyed.
     * Sets the target element to null and removes the modal element from the DOM.
     */
    onDestroy: () => void;
    /**
     * Event handler for click events that triggers the display of the Alt Title modal.
     *
     * @private
     * @remarks
     * This handler is assigned to UI elements to allow users to edit or view the Alt Title attribute.
     */
    private _onClickHandler;
    /**
     * Displays the modal for editing the 'alt' and 'title' attributes of the target element.
     *
     * If a target element is present, this method sets the modal's input fields to the current
     * 'alt' and 'title' attribute values of the target element (or empty strings if not set),
     * and appends the modal element to the document body.
     *
     * @private
     */
    private _showAltTitleModal;
    /**
     * Hides and removes the alt/title modal from the DOM.
     *
     * This method removes the modal's element, effectively closing the modal UI.
     * It is typically called when the modal should no longer be visible to the user.
     *
     * @private
     */
    private _hideAltTitleModal;
    /**
     * Updates the `alt` and `title` attributes of the target image element based on user input.
     * If a title is provided, it sets the `title` attribute; otherwise, it removes it.
     * Additionally, if an image alignment format is applied, it updates the alignment format
     * to include the new title value.
     *
     * @private
     */
    private _setAltTitle;
    /**
     * Creates and configures a modal dialog for editing image `alt` and `title` attributes.
     *
     * The modal includes:
     * - A unique identifier for each instance.
     * - A form with labeled textareas for `alt` and `title` values.
     * - Submit and cancel buttons, with customizable icons and styles.
     * - Event listeners for submitting, cancelling, and closing the modal by clicking outside.
     *
     * Styles and labels are sourced from `this.formatter.options.image.altTitleModalOptions` and `this.formatter.options.overlay.labels`.
     *
     * @returns {AltTitleModal} An object containing references to the modal element, form, alt and title inputs, and the cancel button.
     */
    private _createModal;
    private _onSubmitHandler;
    private _onPointerDownHandler;
}

/**
 * Represents a class type for Attributors, which are used to define and manage
 * custom attributes in Quill editors. This type describes a constructor signature
 * for Attributor classes, including their prototype and the attribute name they handle.
 *
 * @template T The instance type created by the constructor.
 * @property {string} attrName - The name of the attribute managed by the Attributor.
 */
declare type AttributorClass = {
    new (...args: any[]): any;
    prototype: any;
    attrName: string;
};

declare interface Blot {
    domNode: HTMLElement;
    parent: Blot | null;
    next: Blot | null;
    prev: Blot | null;
    statics: any | null;
    format(name: string, value: any): void | undefined;
    formats(): {
        [key: string]: any;
    };
    length(): number;
}

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
declare class BlotFormatter {
    Quill: typeof default_2;
    quill: any;
    options: Options;
    currentSpec: BlotSpec | null;
    specs: BlotSpec[];
    overlay: HTMLElement;
    toolbar: Toolbar;
    sizeInfo: HTMLElement;
    actions: Action[];
    private _startX;
    private _startY;
    private _abortController?;
    private _resizeObserver?;
    private _tooltipContainPosition?;
    ImageAlign: AttributorClass;
    IframeAlign: AttributorClass;
    constructor(quill: any, options?: Partial<Options>);
    /**
     * Destroys the BlotFormatter instance, cleaning up event listeners, actions, toolbar,
     * and DOM references. Also removes any global references and clears internal state.
     * Logs a debug message if the `debug` option is enabled.
     * Catches and logs any errors that occur during the destruction process.
     */
    destroy: () => void;
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
    show: (spec: BlotSpec) => void;
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
    hide: (event?: PointerEvent | null) => void;
    /**
     * Updates the state of the BlotFormatter overlay and its associated actions.
     *
     * This method repositions the overlay to match the current selection or formatting context,
     * triggers the `onUpdate` method for each registered action, and logs a debug message if
     * debugging is enabled in the options.
     *
     * @returns {void}
     */
    update: () => void;
    /**
     * Initializes the actions for the given blot specification.
     *
     * This method retrieves the list of actions from the provided `spec` using `getActions()`,
     * calls the `onCreate()` lifecycle method on each action, and assigns the resulting array
     * to the `actions` property. If debugging is enabled in the options, it logs each created action.
     *
     * @param spec - The blot specification containing the actions to initialize.
     */
    private _createActions;
    /**
     * Destroys all registered actions by calling their `onDestroy` method and clearing the actions array.
     * If debugging is enabled in the options, logs a debug message to the console.
     *
     * @private
     */
    private _destroyActions;
    /**
     * Creates and configures the overlay and size info HTML elements used for formatting blots.
     *
     * The overlay element is styled and configured to be non-selectable, and the size info element
     * is appended to the overlay. Both elements can be customized via the `options.overlay` property.
     *
     * @returns A tuple containing the overlay HTMLElement and the size info HTMLElement.
     */
    private _createOverlay;
    /**
     * Ensures that the toolbar element is visible within the viewport of the Quill editor.
     * If the toolbar is positioned above the visible area of the editor, it scrolls the target element into view
     * with an offset equal to the toolbar's height, then recalculates the toolbar's position.
     * If the toolbar is still above the viewport, it scrolls the window to bring the toolbar into view smoothly.
     *
     * @param toolbarElement - The HTML element representing the toolbar to be scrolled into view.
     * @returns A promise that resolves when any necessary scrolling has completed.
     */
    private _scrollToolbarIntoView;
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
    private _scrollIntoViewWithOffset;
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
    private _addEventListeners;
    /**
     * Removes event listeners and observers associated with the instance.
     *
     * Aborts any ongoing operations managed by the internal AbortController,
     * and disconnects the internal ResizeObserver to stop observing changes.
     *
     * @private
     */
    private _removeEventListeners;
    /**
     * Prevents the default context menu from appearing and stops the event from propagating further.
     *
     * @param event - The event object associated with the context menu action.
     */
    private _preventContextMenu;
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
    private _repositionOverlay;
    /**
     * Sets the CSS `user-select` property (and its vendor-prefixed variants) to the specified value
     * on both the Quill editor root element and the document's root element.
     *
     * This method is typically used to enable or disable text selection within the editor and the page,
     * which can be useful during formatting operations to prevent unwanted user interactions.
     *
     * @param value - The value to set for the `user-select` property (e.g., `'none'`, `'auto'`).
     */
    private _setUserSelect;
    /**
     * Handles the `pointerdown` event on the document to determine whether the blot formatter overlay should be dismissed.
     *
     * If the pointer event target is outside the Quill editor, not within a blot formatter modal,
     * and not a proxy image used by the blot formatter, the overlay is hidden.
     *
     * @param event - The pointer event triggered by user interaction.
     */
    private _onDocumentPointerDown;
    /**
     * Handles pointer click events on the editor.
     *
     * If debugging is enabled in the options, logs the click event to the console.
     * Then, hides the formatter UI in response to the click event.
     *
     * @param event - The pointer event triggered by the user's click.
     */
    private _onClick;
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
    _passWheelEventThrough: (event: WheelEvent) => void;
    /**
     * Handles the touch start event for scrolling interactions.
     * Records the initial X and Y positions of the first touch point.
     * Optionally logs debug information if enabled in options.
     *
     * @param event - The touch event triggered when the user starts touching the screen.
     */
    _onTouchScrollStart: (event: TouchEvent) => void;
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
    _onTouchScrollMove: (event: TouchEvent) => void;
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
    private _registerCustomBlots;
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
    private _keyboardBindings;
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
    _useRelative: (targetElement: HTMLElement) => boolean;
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
    private _getClickPosition;
}
export default BlotFormatter;

/**
 * Abstract base class representing a specification for a Quill blot.
 *
 * `BlotSpec` provides a framework for defining custom blot behaviors and actions
 * within the Quill editor. Subclasses can override methods to implement specific
 * initialization, action handling, and element targeting logic for different blot types.
 *
 * @remarks
 * - Designed to be extended by concrete blot specification classes.
 * - Manages formatter instance and provides utility methods for blot manipulation.
 *
 * @example
 * ```typescript
 * class ImageBlotSpec extends BlotSpec {
 *   // Custom implementation for image blots
 * }
 * ```
 *
 * @property formatter - The `BlotFormatter` instance associated with this spec.
 * @property isUnclickable - Indicates whether the blot is unclickable.
 *
 * @method init - Initializes the blot specification. Intended to be overridden.
 * @method getActions - Returns an array of enabled `Action` objects for the current formatter. Intended to be extended.
 * @method getTargetElement - Returns the target HTML element for the blot. Intended to be overridden.
 * @method getTargetBlot - Retrieves the target blot associated with the current selection.
 * @method getOverlayElement - Returns the overlay element associated with the blot.
 * @method setSelection - Clears the current selection in the Quill editor.
 * @method onHide - Callback invoked when the blot is hidden. Intended to be overridden.
 */
export declare class BlotSpec {
    formatter: BlotFormatter;
    isUnclickable: boolean;
    constructor(formatter: BlotFormatter);
    /**
     * Initializes the blot specification.
     *
     * This method is intended to perform any setup required for the blot spec.
     * It can be overridden by subclasses to provide specific initialization logic.
     *
     */
    init: () => void;
    /**
     * Returns an array of `Action` instances based on the formatter's configuration options.
     *
     * The returned actions may include:
     * - `AlignAction` if aligning is allowed (`options.align.allowAligning`)
     * - `ResizeAction` if resizing is allowed (`options.resize.allowResizing`)
     * - `DeleteAction` if keyboard deletion is allowed (`options.delete.allowKeyboardDelete`)
     * - Always includes `CaretAction`
     *
     * It can be overridden by subclasses to provide additional actions specific to the blot type.
     *
     * @returns {Array<Action>} An array of enabled `Action` objects for the current formatter.
     */
    getActions(): Array<Action>;
    /**
     * Returns the target HTML element associated with this blot.
     *
     * This method is intended to be overridden by subclasses to provide the specific target element
     * for the blot type.
     *
     * @returns {HTMLElement | null} The target element, or `null` if none exists.
     */
    getTargetElement: () => HTMLElement | null;
    /**
     * Retrieves the target blot associated with the current selection.
     *
     * This method first obtains the target DOM element using `getTargetElement()`.
     * If a target element exists, it uses the Quill instance to find and return the corresponding blot.
     * If no target element is found, it returns `null`.
     *
     * @remarks
     * This method uses the quill instance constructor to overcome issue encountered with `Quill.find()`
     * with certain environments where the `Quill` global differs from the one used in the quill instance.
     * In those cases, the `find()` method will always return `null`. These environments include: vite,
     * react and angular.
     *
     * @returns {Blot | null} The blot corresponding to the target element, or `null` if not found.
     */
    getTargetBlot: () => Blot | null;
    /**
     * Returns the overlay element associated with the blot.
     *
     * @returns {HTMLElement | null} The overlay element, or `null` if none exists.
     */
    getOverlayElement: () => HTMLElement | null;
    /**
     * Clears the current selection in the Quill editor by setting it to `null`.
     * This effectively removes any active text selection.
     *
     * @remarks
     * Useful for resetting the editor's selection state, such as after formatting actions.
     */
    setSelection: () => void;
    /**
     * Callback invoked when the blot is hidden.
     * Override this method to implement custom hide behavior.
     */
    onHide: () => void;
}

/**
 * Provides caret (text cursor) manipulation actions for the Quill editor, including moving the caret
 * backward, placing the caret before or after a specified blot, and handling keyboard navigation events.
 *
 * This class is designed to work with the Quill editor and the Blot Formatter overlay, enabling precise
 * caret placement and navigation around custom blots (such as images or embeds) within the editor.
 *
 * @remarks
 * - Integrates with the Quill editor instance and its formatting specifications.
 * - Handles keyboard events to facilitate intuitive caret movement for users.
 * - Ensures proper event listener management to prevent memory leaks.
 *
 * @public
 */
export declare class CaretAction extends Action {
    /**
     * Moves the caret (text cursor) backward by a specified number of characters within the current selection.
     *
     * If the caret is at the beginning of a text node, it attempts to move to the end of the previous sibling text node.
     * If there is no previous sibling or the selection is not valid, the caret position remains unchanged.
     *
     * @param n - The number of characters to move the caret back. Defaults to 1.
     */
    static sendCaretBack: (n?: number, debug?: boolean) => void;
    /**
     * Places the caret (text cursor) immediately before the specified blot in the Quill editor.
     *
     * @param quill - The Quill editor instance.
     * @param targetBlot - The blot before which the caret should be placed.
     */
    static placeCaretBeforeBlot: (quill: any, targetBlot: Blot, debug?: boolean) => void;
    /**
     * Places the caret (text cursor) immediately after the specified blot in the Quill editor.
     *
     * This method first clears any existing selection and ensures the editor is focused.
     * It then calculates the index of the target blot and determines whether it is the last blot in the document.
     * - If the target blot is the last one, the caret is placed at the very end of the document.
     * - Otherwise, the caret is positioned just after the target blot, using a combination of Quill's selection API
     *   and a native browser adjustment to avoid placing the caret inside a formatting span wrapper.
     *
     * @param quill - The Quill editor instance.
     * @param targetBlot - The blot after which the caret should be placed.
     */
    static placeCaretAfterBlot: (quill: any, targetBlot: Blot, debug?: boolean) => void;
    /**
     * Initializes event listeners for the CaretAction.
     *
     * Adds a 'keyup' event listener to the document and an 'input' event listener
     * to the Quill editor's root element. Both listeners trigger the `onKeyUp` handler.
     *
     * @remarks
     * This method should be called when the action is created to ensure proper
     * caret handling and formatting updates in response to user input.
     */
    onCreate: () => void;
    /**
     * Cleans up event listeners attached by this action.
     *
     * Removes the 'keyup' event listener from the document and the 'input' event listener
     * from the Quill editor's root element to prevent memory leaks and unintended behavior
     * after the action is destroyed.
     */
    onDestroy: () => void;
    /**
     * Handles the keyup event for caret navigation around a target blot in the editor.
     *
     * - If a modal is open or there is no current formatting specification, the handler exits early.
     * - If the left arrow key is pressed, places the caret before the target blot and hides the formatter UI.
     * - If the right arrow key is pressed, places the caret after the target blot and hides the formatter UI.
     *
     * @param e - The keyboard event triggered by the user's keyup action.
     */
    onKeyUp: (e: KeyboardEvent) => void;
}

declare type CompressorOptions = {
    jpegQuality: number;
    maxWidth?: number | null;
    styles?: {
        modalBackground?: {
            [key: string]: any;
        } | null | undefined;
        modalContainer?: {
            [key: string]: any;
        } | null | undefined;
        buttonContainer?: {
            [key: string]: any;
        } | null | undefined;
        buttons?: {
            [key: string]: any;
        } | null | undefined;
    } | null | undefined;
    buttons: {
        continue: {
            className: string;
            style?: {
                [key: string]: any;
            } | null | undefined;
        };
        cancel: {
            className: string;
            style?: {
                [key: string]: any;
            } | null | undefined;
        };
        moreInfo: {
            className: string;
            style?: {
                [key: string]: any;
            } | null | undefined;
        };
    };
    text: {
        prompt: string;
        moreInfo: string | null;
        reducedLabel: string;
        nothingToDo: string;
    };
    icons: {
        continue: string;
        moreInfo: string;
        cancel: string;
    };
};

declare type Constructor<T> = new (...args: any[]) => T;

/**
 * Factory function to create a custom Quill Image blot class supporting additional attributes.
 *
 * This function returns a class extending Quill's native Image blot, adding support for the `title` attribute
 * (in addition to `alt`, `height`, and `width`). The returned class overrides the static `formats` method
 * to extract these attributes from the DOM node, and the instance `format` method to set or remove them.
 *
 * @param QuillConstructor - The Quill constructor or instance used to import the base Image blot.
 * @returns A custom Image blot class supporting `alt`, `height`, `width`, and `title` attributes.
 *
 * @remarks
 * - This is useful for enabling the `title` attribute on images in Quill editors, which is not supported by default.
 * - See https://github.com/slab/quill/pull/4350 for related discussion.
 *
 * @example
 * ```typescript
 * const CustomImageBlot = createAltTitleImageBlotClass(Quill);
 * Quill.register(CustomImageBlot);
 * ```
 */
export declare const createAltTitleImageBlotClass: (QuillConstructor: any) => any;

/**
 * Creates a custom Quill Attributor class for handling iframe alignment.
 *
 * This attributor allows alignment of iframe elements within the Quill editor by
 * applying a CSS class and managing related dataset properties. It also handles
 * width styling and tracks whether the width is relative (percentage-based).
 *
 * @param QuillConstructor - The Quill constructor or Quill instance used to import Parchment.
 * @returns A class extending Quill's ClassAttributor, customized for iframe alignment.
 *
 * @example
 *   this.Quill = this.quill.constructor
 *   const IframeAlignClass = createIframeAlignAttributor(this.Quill);
 *   this.IframeAlign = new IframeAlignClass();
 *   this.Quill.register({
 *     'formats/iframeAlign': this.IframeAlign,
 *     'attributors/class/iframeAlign': this.IframeAlign,
 *   }, true);
 *
 * @remarks
 * - Supported alignments: 'left', 'center', 'right'.
 * - Adds/removes the `ql-iframe-align` class and manages `data-blot-align` and `--resize-width` style.
 * - Handles both string and object values for alignment.
 */
export declare const createIframeAlignAttributor: (QuillConstructor: any) => AttributorClass;

/**
 * Creates a custom Quill Attributor class for handling image alignment within a span wrapper.
 *
 * This attributor enables alignment formatting (`left`, `center`, `right`) for images by wrapping them in a `<span>`
 * element with a specific class and managing related attributes such as `data-title` for captions and width handling.
 * It also ensures that the image's alignment and caption are properly reflected in the DOM and Quill's internal model.
 *
 * @param QuillConstructor - The Quill constructor or instance used to import Parchment and related classes.
 * @returns A custom AttributorClass for image alignment formatting.
 *
 * @example
 *   this.Quill = this.quill.constructor
 *   const ImageAlignClass = createImageAlignAttributor(this.Quill);
 *   this.ImageAlign = new ImageAlignClass();
 *   this.Quill.register({
 *     'formats/imageAlign': this.ImageAlign,
 *     'attributors/class/imageAlign': this.ImageAlign,
 *   }, true);
 *
 * @remarks
 * - The attributor manages both string and object values for alignment, supporting additional metadata like `title`.
 * - It ensures the wrapper span is not editable and synchronizes width information for correct CSS rendering.
 * - Handles edge cases where Quill merges inline styles, ensuring the image alignment format is reapplied as needed.
 * - The `remove` and `value` methods ensure proper cleanup and retrieval of alignment state.
 */
export declare const createImageAlignAttributor: (QuillConstructor: any) => AttributorClass;

/**
 * Factory function to create a custom Quill video blot class with responsive styling.
 *
 * @param QuillConstructor - The Quill constructor or instance used to import the base video format.
 * @returns A class extending Quill's VideoEmbed, enforcing a 16:9 aspect ratio and full width for embedded videos.
 *
 * @remarks
 * The returned class, `VideoResponsive`, overrides the default video blot to ensure videos are displayed responsively.
 * The aspect ratio is controlled via the static `aspectRatio` property and applied to the video element's style.
 *
 * @example
 * ```typescript
 * const VideoResponsive = createResponsiveVideoBlotClass(Quill);
 * Quill.register(VideoResponsive);
 * ```
 */
export declare const createResponsiveVideoBlotClass: (QuillConstructor: any) => any;

/**
 * The `DefaultAligner` class provides alignment management for Quill editor blots (such as images and iframes).
 * It implements the `Aligner` interface and is responsible for applying, clearing, and querying alignment
 * formatting on supported blots within the editor.
 *
 * This class supports both inline and block-level blots, and can be configured with custom alignment options.
 * It interacts with Quill's Parchment module to determine blot types and scopes, and uses formatter options
 * to control alignment and resizing behaviors.
 *
 * Key features:
 * - Registers available alignments and exposes them via `getAlignments()`.
 * - Applies alignment to blots using `setAlignment()`, handling both inline (e.g., images) and block (e.g., iframes) elements.
 * - Clears alignment formatting from blots with `clear()`.
 * - Determines blot type and scope with utility methods (`isInlineBlot`, `isBlockBlot`, `hasInlineScope`, `hasBlockScope`).
 * - Checks and retrieves current alignment with `isAligned()` and `getAlignment()`.
 * - Optionally sets relative width for images if configured.
 * - Ensures editor usability by adding a new paragraph if the editor contains only an aligned image.
 *
 * @remarks
 * This class is intended for internal use by the BlotFormatter module and expects a properly configured
 * `BlotFormatter` instance with alignment and resize options.
 *
 * @example
 * ```typescript
 * const aligner = new DefaultAligner(formatter);
 * aligner.setAlignment(blot, 'center');
 * ```
 *
 * @see Aligner
 * @see BlotFormatter
 */
export declare class DefaultAligner implements Aligner {
    alignments: Record<string, Alignment>;
    options: Options;
    formatter: BlotFormatter;
    private debug;
    private Scope;
    constructor(formatter: BlotFormatter);
    /**
     * Retrieves all available alignment options.
     *
     * @returns {Alignment[]} An array of alignment objects defined in the `alignments` property.
     */
    getAlignments: () => Alignment[];
    /**
     * Clears alignment formatting from the given blot if it is an image or iframe.
     *
     * - For image blots (`IMG`), if the parent is a `SPAN`, removes the alignment attribute from the parent.
     * - For iframe blots (`IFRAME`), removes the alignment attribute directly from the blot.
     *
     * @param blot - The blot to clear alignment formatting from, or `null` if none.
     */
    clear: (blot: Blot | null) => void;
    /**
     * Determines whether the given blot is an inline blot.
     *
     * Checks if the provided `blot` has a scope that matches the inline blot scope.
     *
     * @param blot - The blot instance to check.
     * @returns `true` if the blot is an inline blot; otherwise, `false`.
     */
    isInlineBlot: (blot: Blot) => boolean;
    /**
     * Determines if the provided blot is a block-level blot.
     *
     * Checks the blot's static scope against the BLOCK scope constant,
     * and returns true if it matches the BLOCK_BLOT type.
     *
     * @param blot - The blot instance to check.
     * @returns True if the blot is a block blot; otherwise, false.
     */
    isBlockBlot: (blot: Blot) => boolean;
    /**
     * Determines whether the given blot has an inline scope.
     *
     * @param blot - The blot instance to check.
     * @returns `true` if the blot's scope includes the inline scope; otherwise, `false`.
     */
    hasInlineScope: (blot: Blot) => boolean;
    /**
     * Determines whether the given blot has block-level scope.
     *
     * @param blot - The blot instance to check.
     * @returns `true` if the blot's scope includes block-level formatting; otherwise, `false`.
     */
    hasBlockScope: (blot: Blot) => boolean;
    /**
     * Determines whether the given blot is aligned.
     *
     * If an alignment is specified, returns `true` only if the blot's alignment matches the specified alignment.
     * If no alignment is specified, returns `true` if the blot has any alignment.
     *
     * @param blot - The blot to check for alignment.
     * @param alignment - The alignment to compare against, or `null` to check for any alignment.
     * @returns `true` if the blot is aligned (and matches the specified alignment, if provided); otherwise, `false`.
     */
    isAligned: (blot: Blot, alignment: Alignment | null) => boolean;
    /**
     * Retrieves the alignment value from the given blot's DOM node.
     *
     * @param blot - The blot instance whose alignment is to be determined.
     * @returns The alignment value as a string if present, otherwise `undefined`.
     */
    getAlignment: (blot: Blot) => string | undefined;
    /**
     * Sets the alignment for a given blot (content element) in the editor.
     *
     * This method checks if the blot is already aligned as requested. If not, it clears any existing alignment,
     * and applies the new alignment based on the blot type (inline or block). For inline blots (such as images),
     * it may also set a relative width attribute if required by the configuration. For block blots (such as iframes),
     * it applies the alignment directly.
     *
     * Additionally, if the editor contains only an image, it ensures a new paragraph is added underneath to maintain
     * editor usability.
     *
     * @param blot - The blot (content element) to align. Can be `null`, in which case no action is taken.
     * @param alignment - The alignment to apply (e.g., 'left', 'center', 'right'). Must correspond to a key in `this.alignments`.
     */
    setAlignment: (blot: Blot | null, alignment: string) => void;
}

export declare const DefaultOptions: Options;

/**
 * Represents an action that handles deletion of a selected blot in a Quill editor.
 *
 * The `DeleteAction` class listens for keyboard and input events to detect when the user
 * presses the 'Delete' or 'Backspace' keys. If a blot is selected and no modal is open,
 * it deletes the corresponding blot from the editor and hides the formatter UI.
 *
 * @remarks
 * - Event listeners are attached on creation and removed on destruction to prevent memory leaks.
 * - The action only triggers when a blot is selected and no modal dialog with attribute `data-blot-formatter-modal` is open.
 *
 * @example
 * ```typescript
 * const deleteAction = new DeleteAction(formatter);
 * deleteAction.onCreate();
 * // ... later
 * deleteAction.onDestroy();
 * ```
 */
export declare class DeleteAction extends Action {
    /**
     * Initializes event listeners for the delete action.
     *
     * - Adds a 'keyup' event listener to the document that triggers `_onKeyUp`.
     * - Adds an 'input' event listener to the Quill editor's root element that also triggers `_onKeyUp`.
     *
     * This method should be called when the delete action is created to ensure
     * proper handling of keyboard and input events.
     */
    onCreate: () => void;
    /**
     * Cleans up event listeners associated with the action.
     *
     * Removes the 'keyup' event listener from the document and the 'input' event listener
     * from the Quill editor's root element to prevent memory leaks and unintended behavior
     * after the action is destroyed.
     */
    onDestroy: () => void;
    /**
     * Handles the keyup event for delete and backspace actions.
     *
     * If no modal is open and a current spec is selected, checks if the pressed key is
     * 'Delete' or 'Backspace'. If so, finds the target blot element in the Quill editor,
     * determines its index, and deletes one character at that index. Afterwards, hides the formatter UI.
     *
     * @param e - The keyboard event triggered by the user.
     */
    private _onKeyUp;
}

declare type DeleteOptions = {
    allowKeyboardDelete: boolean;
};

/**
 * Represents a specification for handling iframe-based video blots within the Quill editor.
 * Extends {@link UnclickableBlotSpec} to provide formatting capabilities for video iframes
 * that should not be clickable.
 *
 * @remarks
 * This class is intended to be used with the BlotFormatter to manage video embeds
 * that use iframes, such as YouTube or Vimeo videos.
 *
 * @param formatter - The {@link BlotFormatter} instance used to apply formatting logic.
 */
export declare class IframeVideoSpec extends UnclickableBlotSpec {
    constructor(formatter: BlotFormatter);
}

declare type ImageOptions = {
    allowAltTitleEdit: Boolean;
    registerImageTitleBlot: Boolean;
    altTitleModalOptions: AltTitleModalOptions;
    registerArrowRightFix: Boolean;
    allowCompressor: Boolean;
    compressorOptions: CompressorOptions;
    linkOptions: LinkOptions;
    autoHeight: boolean;
};

/**
 * Represents a specification for handling image elements within a Quill editor instance.
 *
 * `ImageSpec` extends `BlotSpec` to provide image-specific functionality, including:
 * - Initializing event listeners for image selection.
 * - Determining available actions (link editing, alt/title editing, compression) based on formatter options.
 * - Managing the currently selected image element.
 * - Handling UI display and cleanup when the image overlay is shown or hidden.
 *
 * @remarks
 * This class is intended to be used as part of the Quill Blot Formatter extension for rich image editing.
 *
 * @extends BlotSpec
 */
export declare class ImageSpec extends BlotSpec {
    img: HTMLElement | null;
    constructor(formatter: BlotFormatter);
    /**
     * Initializes the image spec by attaching a click event listener to the Quill editor's root element.
     * The event listener triggers the `onClick` handler when the root element is clicked.
     */
    init: () => void;
    /**
     * Returns an array of available actions for the image spec, based on the current formatter options and image eligibility.
     *
     * The returned actions may include:
     * - `LinkAction`: If link editing is allowed (`image.linkOptions.allowLinkEdit`).
     * - `AttributeAction`: If alt/title editing is allowed (`image.allowAltTitleEdit`).
     * - `CompressAction`: If compression is allowed (`image.allowCompressor`) and the image is eligible for compression.
     *
     * @returns {Array<Action>} The list of actions applicable to the current image spec.
     */
    getActions: () => Array<Action>;
    /**
     * Returns the target HTML element associated with this instance.
     *
     * @returns {HTMLElement | null} The image element if available, otherwise `null`.
     */
    getTargetElement: () => HTMLElement | null;
    /**
     * Handles the hide event by resetting the image reference to null.
     * This is typically called when the overlay should no longer be displayed or interacted with.
     */
    onHide: () => void;
    /**
     * Handles click events on image elements.
     *
     * If the clicked element is an HTMLImageElement, prevents the default behaviour
     * (such as opening links), stores a reference to the image, and displays the formatter UI.
     *
     * @param event - The mouse event triggered by the click.
     */
    onClick: (event: MouseEvent) => void;
}

/**
 * Handles the link editing action for image blots within the Quill editor.
 *
 * `LinkAction` provides UI and logic for adding, editing, and removing links on image blots.
 * It manages the display and positioning of a modal dialog for link input, attaches and removes
 * event listeners for modal interaction, and applies or removes link formats on the target blot.
 *
 * @remarks
 * - Integrates with the BlotFormatter overlay and toolbar system.
 * - Ensures modal dialog is accessible and correctly positioned relative to the editor.
 * - Cleans up all resources and event listeners on destruction.
 *
 * @extends Action
 *
 * @public
 */
export declare class LinkAction extends Action {
    targetElement: HTMLElement | null | undefined;
    currentBlot: Blot | null | undefined;
    toolbarButton: ToolbarButton;
    linkOptions: LinkOptions;
    modal?: {
        dialog: HTMLDialogElement;
        background: HTMLDivElement;
        form: HTMLFormElement;
        label: HTMLLabelElement;
        input: HTMLInputElement;
        okButton: HTMLButtonElement;
        cancelButton: HTMLButtonElement;
        removeButton: HTMLButtonElement;
    };
    constructor(formatter: BlotFormatter);
    /**
     * Initializes the action by setting the `targetElement` property.
     * Retrieves the target element from the current formatter specification, if available.
     * This method is typically called when the action is created.
     */
    onCreate: () => void;
    /**
     * Cleans up resources when the action is destroyed.
     * - Sets the target element to null.
     * - Removes any attached event listeners.
     * - Hides the link modal if it is visible.
     */
    onDestroy: () => void;
    /**
     * Attaches all necessary event listeners to the modal elements for handling
     * link-related actions such as submitting the form, blocking certain key events,
     * handling input changes, canceling, removing links, and managing background/context menu interactions.
     *
     * This method should be called after the modal elements are initialized to ensure
     * proper event handling within the link modal dialog.
     *
     * @private
     */
    private _addEventListeners;
    /**
     * Removes all event listeners attached to the modal elements.
     *
     * This method detaches event handlers from the modal's dialog, form, input,
     * cancel button, remove button, background, and input context menu to prevent
     * memory leaks and unintended behavior when the modal is no longer in use.
     *
     * @private
     */
    private _removeEventListeners;
    /**
     * Prevents the event from propagating further in the event chain.
     * This method is typically used to trap context menu or similar events,
     * ensuring that no other event listeners are triggered for the same event.
     *
     * @param e - The event to be stopped.
     */
    private _trapContextEvent;
    /**
     * Event handler that is triggered when the associated element is clicked.
     * Invokes the `showLinkModal` method to display the link editing modal.
     *
     * @private
     * @remarks
     * This handler is typically bound to a UI element to allow users to edit or add links.
     */
    private _onClickHandler;
    /**
     * Handles click events on the modal background.
     *
     * If the click event's target is the modal background, this method prevents the default behavior,
     * stops the event from propagating further, and hides the link modal.
     *
     * @param e - The mouse event triggered by the user's click.
     */
    private _onBackgroundClick;
    /**
     * Displays the link modal dialog for editing or inserting a link.
     *
     * If a target element is present, this method constructs the modal,
     * appends it to the formatter's overlay, and sets up necessary event listeners.
     * The modal is initially hidden to prevent flicker, then shown after being
     * positioned correctly relative to the target element.
     *
     * @returns {void}
     */
    showLinkModal: () => void;
    /**
     * Builds and returns the modal elements used for editing or inserting a link.
     *
     * This method creates a dialog element containing a form with a label, input field for the URL,
     * and three buttons: OK (submit), Remove, and Cancel. It also creates a background mask element.
     * All elements are styled and configured according to the `linkOptions` provided to the class.
     *
     * @returns An object containing references to the created modal elements:
     * - `dialog`: The dialog element that serves as the modal container.
     * - `background`: The background mask element for the modal.
     * - `form`: The form element inside the dialog.
     * - `label`: The label element for the input.
     * - `input`: The input element for entering the link URL.
     * - `okButton`: The submit button for confirming the link.
     * - `cancelButton`: The button for cancelling the operation.
     * - `removeButton`: The button for removing the link.
     */
    private _buildModal;
    /**
     * Positions the given dialog element centered over the formatter's overlay,
     * ensuring it stays within the bounds of the Quill editor root element.
     *
     * The method calculates the overlay and Quill root bounding rectangles,
     * determines the dialog's dimensions, and computes the appropriate
     * `left` and `top` CSS properties to center the dialog over the overlay.
     * The horizontal & vertical position is clamped so the dialog does not overflow
     * the Quill root element.
     *
     * @param dialog - The HTMLDialogElement to position.
     */
    private _positionModal;
    /**
     * Hides and cleans up the link modal dialog.
     *
     * This method closes and removes the modal dialog and its background overlay if they exist,
     * removes any associated event listeners, and resets the modal reference to undefined.
     */
    hideLinkModal: () => void;
    /**
     * Handles the form submission event for the link action.
     *
     * Prevents the default form submission behavior, extracts the URL from the form data,
     * and applies or removes a link on the current blot based on the URL's presence.
     *
     * @param event - The form submission event.
     */
    private _formSubmitHandler;
    /**
     * Retrieves the link format associated with the current blot, if any.
     *
     * @returns {any | null} The link URL if the current blot has a link format, otherwise `null`.
     *
     * @remarks
     * This method checks if the current blot exists and has a DOM node. It then retrieves the index of the blot
     * in the Quill editor and fetches its formats. If a link format is present, it returns the link value; otherwise, it returns `null`.
     */
    getLink: () => any;
    /**
     * Removes the link format from the current image blot's parent wrapper, if present.
     *
     * Traverses up the blot hierarchy from the current image blot to find a parent blot
     * with a 'link' format. If found, it removes the link format from that wrapper.
     * After removing the link, it hides the link modal and deselects the toolbar button.
     *
     * @returns {void}
     */
    removeLink: () => void;
    /**
     * Applies a link to the current blot if the provided URL is different from the existing link.
     * Removes any existing link, formats the current blot with the new link, and updates the toolbar button state.
     * Hides the link modal after applying the link.
     *
     * @param url - The URL to apply as a link to the current blot.
     */
    applyLink: (url: string) => void;
}

declare type LinkOptions = {
    allowLinkEdit: Boolean;
    modal: {
        dialog: {
            className: string;
            style?: {
                [key: string]: any;
            } | null | undefined;
        };
        background: {
            className: string;
            style?: {
                [key: string]: any;
            } | null | undefined;
        };
        form: {
            className: string;
            style?: {
                [key: string]: any;
            } | null | undefined;
        };
        label: {
            className: string;
            style?: {
                [key: string]: any;
            } | null | undefined;
            text: string;
        };
        input: {
            className: string;
            style?: {
                [key: string]: any;
            } | null | undefined;
            placeholder?: string | null | undefined;
        };
        buttons: {
            submit: {
                className: string;
                style?: {
                    [key: string]: any;
                } | null | undefined;
                icon: string;
                tooltip: string;
            };
            cancel: {
                className: string;
                style?: {
                    [key: string]: any;
                } | null | undefined;
                icon: string;
                tooltip: string;
            };
            remove: {
                className: string;
                style?: {
                    [key: string]: any;
                } | null | undefined;
                icon: string;
                tooltip: string;
            };
        };
    };
};

export declare type Options = {
    specs: Array<Constructor<BlotSpec>>;
    overlay: OverlayOptions;
    align: AlignOptions;
    resize: ResizeOptions;
    delete: DeleteOptions;
    toolbar: ToolbarOptions;
    image: ImageOptions;
    video: VideoOptions;
    tooltip?: TooltipOptions;
    debug?: boolean;
};

declare type OverlayOptions = {
    className: string;
    style?: {
        [key: string]: any;
    } | null | undefined;
    sizeInfoStyle?: {
        [key: string]: any;
    } | null | undefined;
    labels?: {
        [key: string]: any;
    } | null | undefined;
};

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
export declare class ResizeAction extends Action {
    private _topLeftHandle;
    private _topRightHandle;
    private _bottomRightHandle;
    private _bottomLeftHandle;
    private _dragHandle;
    private _dragStartX;
    private _dragCursorStyle;
    private _preDragWidth;
    private _pinchStartDistance;
    private _calculatedAspectRatio;
    private _computedAspectRatio;
    private _target;
    private _editorStyle;
    private _editorWidth;
    private _useRelativeSize;
    private _resizeModeButton;
    private _isUnclickable;
    private _hasResized;
    private _formattedWidth;
    private _sizeInfoTimerId;
    private _isImage;
    private _isSVG;
    private _naturalWidth;
    constructor(formatter: BlotFormatter);
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
    onCreate: () => void;
    /**
     * Cleans up resources and event listeners associated with the resize action.
     *
     * This method resets internal state, removes resize handles from the overlay,
     * detaches mouse and touch event listeners, and triggers an update on the formatter.
     *
     * Should be called when the resize action is no longer needed to prevent memory leaks
     * and unintended behavior.
     */
    onDestroy: () => void;
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
    private _createHandle;
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
    private _repositionHandles;
    /**
     * Sets the cursor style for the document body and all its children.
     * When a non-empty value is provided, it applies the specified cursor style
     * globally by injecting a style element into the document head.
     * When an empty value is provided, it removes the previously injected style element,
     * reverting the cursor to its default behavior.
     *
     * @param value - The CSS cursor value to apply (e.g., 'pointer', 'col-resize').
     */
    private _setCursor;
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
    private _resizeMode;
    /**
     * Handles the pointer down event on a resize handle.
     *
     * Initiates the resize mode, sets up the drag handle, and stores the starting X position.
     * Adds event listeners for pointer move and pointer up to enable drag behavior.
     *
     * @param event - The pointer event triggered when the user presses down on a resize handle.
     */
    private _onHandlePointerDown;
    /**
     * Handles the drag event for a resize handle, updating the target element's width.
     *
     * Calculates the new width based on the pointer's movement and the initial drag position.
     * Ensures the new width stays within the editor's bounds and does not shrink below the minimum allowed width.
     * Applies the new width to both the target element and its overlay.
     *
     * @param event - The pointer event triggered during dragging.
     */
    private _onHandleDrag;
    /**
     * Handles the pointer up event on the resize handle.
     *
     * This method disables resize mode, resets the cursor style,
     * and removes the event listeners for pointer movement and pointer up events.
     * It is typically called when the user releases the pointer after resizing.
     */
    private _onHandlePointerUp;
    /**
     * Handles the touch start event on the overlay element.
     * If the overlay itself is the _target, enables resize mode.
     * When two fingers touch the target element, prevents default scrolling,
     * calculates the initial distance between the fingers for pinch-to-resize,
     * and stores the initial width of the target element.
     *
     * @param event - The touch event triggered on the overlay.
     */
    private _onOverlayTouchStart;
    /**
     * Handles touch move events on the overlay for resizing the target element via pinch gestures.
     *
     * When two fingers are detected on the overlay, calculates the distance between them to determine
     * the scale factor for resizing. The new width is constrained between a minimum of 10px and the
     * maximum editor width. Prevents default touch behavior such as scrolling during the gesture.
     *
     * @param event - The touch event triggered by user interaction.
     */
    private _onOverlayTouchMove;
    /**
     * Handles the touch end event on the overlay element.
     * If the touch event's target is the formatter's overlay, it disables resize mode.
     *
     * @param event - The touch event triggered on the overlay.
     */
    private _onOverlayTouchEnd;
    /**
     * Handles the mouse down event on the overlay element.
     * If the event target is the formatter's overlay, enables resize mode.
     *
     * @param event - The mouse event triggered by the user interaction.
     */
    private _onOverlayMouseDown;
    /**
     * Handles the mouse up event on the overlay element.
     * If the event target is the formatter's overlay, it disables resize mode.
     *
     * @param event - The mouse event triggered when the user releases the mouse button.
     */
    private _onOverlayMouseUp;
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
    private _resizeTarget;
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
    private _showSizeInfo;
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
    private _updateSizeInfo;
    get isRelative(): boolean;
    get isAligned(): boolean;
    /**
     * Creates a toolbar button for toggling the resize mode.
     *
     * The button is initialized with a unique identifier, a click handler, and toolbar options.
     * The `preselect` property is set to indicate whether the resize mode is currently relative.
     *
     * @returns {ToolbarButton} The configured resize mode toolbar button.
     */
    private _createResizeModeButton;
    /**
     * Handles the click event for the resize mode control.
     * Stops the event from propagating further and swaps the resize mode.
     *
     * @param event - The event object triggered by the click.
     */
    private _onResizeModeClickHandler;
    /**
     * Swaps the resize mode of the target element between relative (percentage-based) and absolute (pixel-based) sizing.
     * Updates the _target's width and height attributes, as well as relevant CSS custom properties and data attributes,
     * depending on the current resize mode and alignment. Also updates the toolbar button state and optionally displays
     * size information.
     *
     * @param showInfo - If true, displays size information after resizing.
     */
    private _swapResizeMode;
    /**
     * Initiates a timer to fade out the size information element after a delay.
     * Sets the opacity of the `sizeInfo` element to 0 with a transition effect after 1 second.
     * Stores the timer ID in `_sizeInfoTimerId` for potential future reference or cancellation.
     */
    private _closeSizeInfo;
    /**
     * Cancels the active size info timer, if one exists.
     * Clears the timeout associated with `_sizeInfoTimerId` and resets the timer ID to `null`.
     */
    private _cancelSizeInfoTimer;
    /**
     * Calculates the Euclidean distance between two touch points.
     *
     * @param touch1 - The first touch point.
     * @param touch2 - The second touch point.
     * @returns The distance in pixels between the two touch points.
     */
    private _calculateDistance;
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
    private _roundDimension;
    /**
     * Determines whether the target image is an SVG image.
     *
     * Checks if the target is an HTMLImageElement and then verifies:
     * - If the image source is a data URL, it checks for the 'image/svg+xml' MIME type.
     * - Otherwise, it checks if the image source URL ends with '.svg'.
     *
     * @returns {boolean} True if the target image is an SVG, otherwise false.
     */
    private _isSvgImage;
}

declare type ResizeOptions = {
    allowResizing: boolean;
    allowResizeModeChange: boolean;
    imageOversizeProtection: boolean;
    handleClassName: string;
    handleStyle?: {
        [key: string]: any;
    } | null | undefined;
    useRelativeSize: boolean;
    minimumWidthPx: number;
};

/**
 * Manages the creation, display, and destruction of a toolbar for BlotFormatter actions.
 *
 * The `Toolbar` class is responsible for rendering toolbar buttons associated with registered actions,
 * handling their lifecycle, and appending/removing the toolbar element from the formatter's overlay.
 *
 * @remarks
 * - The toolbar is initialized and shown via the `create()` method, which collects all action buttons and appends them to the DOM.
 * - The `destroy()` method cleans up the toolbar, removes it from the DOM, and destroys all associated buttons to prevent memory leaks.
 *
 * @example
 * ```typescript
 * const toolbar = new Toolbar(formatter);
 * toolbar.create(); // Show toolbar
 * // ... later
 * toolbar.destroy(); // Hide and clean up toolbar
 * ```
 *
 * @public
 */
export declare class Toolbar {
    formatter: BlotFormatter;
    element: HTMLElement;
    buttons: Record<string, ToolbarButton>;
    constructor(formatter: BlotFormatter);
    /**
     * Creates and appends toolbar action buttons to the toolbar element.
     * Called by BlotFormatter.show() to initialize the toolbar.
     *
     * Iterates through all actions registered in the formatter, collects their toolbar buttons,
     * stores each button in the `buttons` map by its action name, and appends the created button elements
     * to the toolbar's DOM element. Finally, appends the toolbar element to the formatter's overlay.
     */
    create: () => void;
    /**
     * Cleans up the toolbar by removing its element from the overlay,
     * destroying all associated buttons, and clearing internal references.
     * Called by BlotFormatter.hide() to remove the toolbar from the DOM.
     *
     * This should be called when the toolbar is no longer needed to prevent memory leaks.
     */
    destroy: () => void;
}

/**
 * Represents a toolbar button used in the Quill editor's formatting toolbar.
 *
 * The `ToolbarButton` class encapsulates the creation, management, and styling of a single toolbar button.
 * It provides methods for initializing the button element, handling selection and visibility states,
 * applying custom styles, and cleaning up resources when the button is destroyed.
 * Instances of this class should be added to the `toolbarButtons` array of an `Action` class.
 *
 * @implements {_ToolbarButton}
 *
 * @remarks
 * - The button's icon, action, and event handler are configured via the constructor.
 * - Customization options for styling, tooltips, and class names are provided through the `ToolbarOptions` object.
 * - Selection and visibility states are managed via getter/setter properties.
 * - The class is designed to be extended for custom selection logic via the `preselect` method.
 *
 * @example
 * ```typescript
 *     someAction.toolbarButtons = [
 *         new ToolbarButton(
 *             'someActionName',
 *             this.onClickHandler,
 *             this.formatter.options.toolbar,
 *         )
 *     ]
 * ```
 */
export declare class ToolbarButton implements _ToolbarButton {
    action: string;
    icon: string;
    onClick: EventListener;
    options: ToolbarOptions;
    element: HTMLElement | null;
    initialVisibility: boolean;
    constructor(action: string, onClickHandler: EventListener, options: ToolbarOptions);
    /**
     * Creates and initializes the toolbar button element.
     *
     * This method constructs a `span` element, sets its inner HTML to the provided icon,
     * assigns the appropriate class name and action data attribute, and attaches the click handler.
     * If tooltips are configured for the action, it sets the tooltip text.
     * The button's selected and visible states are initialized, and custom styling is applied.
     *
     * @returns {HTMLElement} The created and configured toolbar button element.
     */
    create: () => HTMLElement;
    /**
     * Cleans up the toolbar button by removing its click event handler,
     * detaching it from the DOM, and clearing the reference to the element.
     * This method should be called when the button is no longer needed to
     * prevent memory leaks.
     */
    destroy: () => void;
    /**
     * Determines whether the toolbar button should appear as selected (active) when loaded.
     * Override this method to provide custom logic for button selection state.
     *
     * @returns {boolean} `true` if the button should be preselected; otherwise, `false`.
     */
    preselect: () => boolean;
    /**
     * Indicates whether the toolbar button is currently selected.
     *
     * Returns `true` if the underlying element's `data-selected` attribute is set to `'true'`, otherwise returns `false`.
     */
    get selected(): boolean;
    /**
     * Sets the selected state of the toolbar button.
     *
     * When set to `true`, applies the selected class and style to the button element.
     * When set to `false`, removes the selected class and style, and reapplies the default button style if provided.
     * Also updates the `data-selected` attribute on the element.
     *
     * @param value - Indicates whether the button should be in the selected state.
     */
    set selected(value: boolean);
    /**
     * Indicates whether the toolbar button is currently visible.
     * Returns `true` if the button's element is not hidden (`display` is not set to `'none'`), otherwise returns `false`.
     */
    get visible(): boolean;
    /**
     * Sets the visibility of the toolbar button element.
     * Accepts a CSS display value as a string or a boolean.
     * If a boolean is provided, `true` sets the display to 'inline-block', and `false` sets it to 'none'.
     * If a string is provided, it is used directly as the CSS display value.
     *
     * @param style - The desired visibility state, either as a CSS display string or a boolean.
     */
    set visible(style: string | boolean);
    /**
     * Applies custom styles to the toolbar button and its SVG child element, if provided in the options.
     *
     * - If `options.buttonStyle` is defined, it merges the style properties into the button's element.
     * - If `options.svgStyle` is defined, it merges the style properties into the first child element (assumed to be an SVG).
     *
     * @private
     */
    private _styleButton;
}

declare interface _ToolbarButton {
    action: string;
    element: HTMLElement | null;
    icon: string;
    selected: boolean;
    visible: boolean;
    onClick: EventListener;
    options: ToolbarOptions;
    create(action: string, icon: string): HTMLElement;
}

declare type ToolbarOptions = {
    icons: Record<string, string>;
    tooltips?: Record<string, string> | null | undefined;
    mainClassName: string;
    mainStyle?: {
        [key: string]: any;
    } | null | undefined;
    buttonStyle?: {
        [key: string]: any;
    } | null | undefined;
    buttonClassName: string;
    buttonSelectedStyle?: {
        [key: string]: any;
    } | null | undefined;
    buttonSelectedClassName: string;
    svgStyle?: {
        [key: string]: any;
    } | null | undefined;
};

export declare class TooltipContainPosition {
    private readonly quill;
    private readonly debug;
    /**
     * Repositions a tooltip element within a given container to ensure it does not overflow
     * the container's boundaries. Adjusts the tooltip's `top` and `left` CSS properties if
     * necessary to keep it fully visible. Optionally logs debug information about the repositioning.
     *
     * @param tooltip - The tooltip HTMLDivElement to reposition.
     * @param container - The container HTMLElement within which the tooltip should remain visible.
     * @param debug - If true, logs debug information to the console. Defaults to false.
     */
    private static _repositionTooltip;
    private static observers;
    /**
     * Observes changes to the tooltip's attributes and triggers repositioning when necessary.
     *
     * @param quill - The Quill editor instance containing the tooltip.
     * @param debug - Optional flag to enable debug logging of attribute mutations.
     *
     * @remarks
     * Uses a MutationObserver to monitor changes to the tooltip's `style` and `class` attributes.
     * When a mutation is detected, the tooltip is repositioned within the container.
     * If `debug` is true, mutation details are logged to the console.
     */
    static watchTooltip(quill: default_2, debug?: boolean): void;
    /**
     * Removes the MutationObserver for the specified tooltip element.
     *
     * @param tooltip - The HTMLDivElement or Quill instance to stop watching.
     *                  If a Quill instance is provided, finds the tooltip within its container.
     */
    static removeTooltipWatcher(tooltip: HTMLDivElement | default_2, debug?: boolean): void;
    /**
     * Initializes the tooltip adjustment watcher when the action is created.
     * Searches for the tooltip element within the Quill container and, if found,
     * sets up observation for tooltip adjustments. Logs a warning if the tooltip
     * element is not present.
     *
     * @remarks
     * This method should be called during the creation lifecycle of the action.
     */
    constructor(quill: default_2, debug?: boolean);
    /**
     * Cleans up resources when the action is destroyed.
     * Specifically, it finds the tooltip element within the Quill editor container
     * and removes its associated watcher if the tooltip exists.
     */
    destroy: () => void;
}

declare type TooltipOptions = {
    containTooltipPosition: boolean;
};

/**
 * Represents a Quill BlotSpec for managing "unclickable" elements within the editor.
 *
 * This class overlays transparent proxy images on unclickable HTML elements (such as videos)
 * to intercept user interactions and enable custom formatting behaviour. It tracks proxies,
 * synchronizes their positions with the underlying elements, and manages event listeners
 * for editor changes, scrolling, and resizing.
 *
 * Key Features:
 * - Automatically creates and removes proxy overlays for unclickable elements.
 * - Repositions proxies on editor scroll and resize events.
 * - Handles click events on proxies to trigger formatter overlays.
 * - Passes through wheel and touch events for smooth scrolling.
 *
 * @remarks
 * - Proxies are managed using a randomly generated ID stored in the element's dataset.
 * - The proxy container is appended to the Quill editor's container and holds all proxy images.
 * - Designed to work with Quill's BlotFormatter extension for custom video or media formatting.
 *
 * @extends BlotSpec
 */
export declare class UnclickableBlotSpec extends BlotSpec {
    selector: string;
    unclickable: HTMLElement | null;
    proxyContainer: HTMLElement;
    unclickableProxies: UnclickableProxies;
    isUnclickable: boolean;
    constructor(formatter: BlotFormatter);
    /**
     * Initializes event listeners and observers for unclickable blot proxies.
     * - Sets up a listener for Quill's 'text-change' event to handle updates.
     * - Adds a scroll event listener to the Quill root to reposition proxy images when scrolling occurs.
     * - Observes editor resize events to maintain correct proxy positioning.
     */
    init: () => void;
    /**
     * Observes the Quill editor's root element for resize events and triggers repositioning
     * of proxy images when the editor's dimensions change (e.g., due to screen resize or editor grow/shrink).
     * Uses a debounced approach to avoid excessive repositioning by waiting 200ms after the last resize event.
     *
     * @remarks
     * This method sets up a `ResizeObserver` on the editor's root element and calls
     * `_repositionProxyImages` whenever a resize is detected, with debouncing to improve performance.
     */
    private _observeEditorResize;
    /**
     * Returns the target HTML element associated with this instance.
     *
     * @returns {HTMLElement | null} The unclickable HTML element, or `null` if not set.
     */
    getTargetElement: () => HTMLElement | null;
    /**
     * Returns the overlay HTML element associated with the blot, or `null` if none exists.
     *
     * @returns {HTMLElement | null} The unclickable overlay element, or `null` if not set.
     */
    getOverlayElement: () => HTMLElement | null;
    /**
     * Handles changes to the text content within the Quill editor.
     *
     * This method performs the following actions:
     * 1. Checks if any "unclickable" elements tracked by proxies have been deleted from the editor.
     *    If so, it removes their corresponding proxy images and cleans up the tracking object.
     * 2. Searches for new "unclickable" elements that do not yet have a proxy image and creates proxies for them.
     * 3. Repositions all proxy images to ensure they are correctly aligned with their associated elements.
     *
     * This method is intended to be called whenever the editor's content changes to keep proxy images in sync.
     */
    private _onTextChange;
    /**
     * Creates a transparent proxy image overlay for an unclickable HTML element.
     * The proxy image is linked to the unclickable element via a randomly generated ID,
     * which is stored in the element's dataset and used as a key in the `unclickableProxies` record.
     * The proxy image is styled to be absolutely positioned and unselectable, and is appended to the proxy container.
     * Event listeners are attached to the proxy image to handle click, context menu, wheel, and touch events,
     * allowing interaction to be managed or passed through as needed.
     *
     * @param unclickable - The target HTMLElement to overlay with a transparent proxy image.
     */
    private _createUnclickableProxyImage;
    /**
     * Repositions proxy images to overlay their corresponding "unclickable" elements
     * within the Quill editor container. Calculates each unclickable element's position
     * relative to the container, accounting for scroll offsets, and updates the proxy image's
     * style properties (`left`, `top`, `width`, `height`) accordingly.
     *
     * Handles errors gracefully by logging any issues encountered during positioning.
     *
     * @private
     */
    private _repositionProxyImages;
    /**
     * Handles click events on proxy images representing unclickable blots.
     * Retrieves the associated unclickable blot using the proxy's dataset ID,
     * updates the `unclickable` property, and displays the formatter overlay.
     *
     * @param event - The mouse event triggered by clicking the proxy image.
     */
    private _onProxyImageClick;
    /**
     * Creates a proxy container element (`div`) with the class 'proxy-container' and appends it
     * to the Quill editor's container. This container is used to hold all proxy images.
     *
     * @returns {HTMLElement} The newly created proxy container element.
     * @private
     */
    private _createProxyContainer;
}

declare type UnclickableProxies = Record<string, UnclickableProxy>;

declare type UnclickableProxy = {
    unclickable: HTMLElement;
    proxyImage: HTMLElement;
};

declare type VideoOptions = {
    selector: string;
    registerCustomVideoBlot: Boolean;
    registerBackspaceFix: Boolean;
    defaultAspectRatio: string;
    proxyStyle: {
        [key: string]: any;
    };
};

export { }
