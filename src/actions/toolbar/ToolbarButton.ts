import { ToolbarOptions } from "../../Options";

export interface _ToolbarButton {
    action: string;
    element: HTMLElement | null;
    icon: string;
    selected: boolean;
    visible: boolean;
    onClick: EventListener;
    options: ToolbarOptions;
    create(action: string, icon: string): HTMLElement;
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
export default class ToolbarButton implements _ToolbarButton {
    action: string;
    icon: string;
    onClick: EventListener;
    options: ToolbarOptions;
    element: HTMLElement | null = null;
    initialVisibility: boolean = true; // preset visibility before button is created

    constructor(
        action: string,
        onClickHandler: EventListener,
        options: ToolbarOptions
    ) {
        this.action = action;
        this.icon = options.icons[action as keyof typeof options.icons];
        this.onClick = onClickHandler;
        this.options = options;
    }

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
    create = (): HTMLElement => {
        this.element = document.createElement('span');
        this.element.innerHTML = this.icon;
        this.element.className = this.options.buttonClassName;
        this.element.dataset.action = this.action;
        this.element.onclick = this.onClick;
        if (this.options.tooltips && this.options.tooltips[this.action]) {
            this.element.title = this.options.tooltips[this.action];
        }
        this.selected = this.preselect();
        this.visible = this.initialVisibility;
        this._styleButton();
        return this.element;
    }

    /**
     * Cleans up the toolbar button by removing its click event handler,
     * detaching it from the DOM, and clearing the reference to the element.
     * This method should be called when the button is no longer needed to
     * prevent memory leaks.
     */
    destroy = (): void => {
        if (this.element) {
            this.element.onclick = null;
            this.element.remove();
            this.element = null;
        }
    }

    /**
     * Determines whether the toolbar button should appear as selected (active) when loaded.
     * Override this method to provide custom logic for button selection state.
     *
     * @returns {boolean} `true` if the button should be preselected; otherwise, `false`.
     */
    preselect = (): boolean => {
        // override this with logic to show if button is selected (active) when loaded
        // someCriteria: boolean = true / false;
        // return someCriteria;
        return false;
    }

    /**
     * Indicates whether the toolbar button is currently selected.
     *
     * Returns `true` if the underlying element's `data-selected` attribute is set to `'true'`, otherwise returns `false`.
     */
    get selected(): boolean {
        return this.element?.dataset.selected === 'true';
    }

    /**
     * Sets the selected state of the toolbar button.
     * 
     * When set to `true`, applies the selected class and style to the button element.
     * When set to `false`, removes the selected class and style, and reapplies the default button style if provided.
     * Also updates the `data-selected` attribute on the element.
     *
     * @param value - Indicates whether the button should be in the selected state.
     */
    set selected(value: boolean) {
        if (this.element) {
            this.element.dataset.selected = value.toString();
            // apply styles to indicate selected state
            if (value) {
                this.element.classList.add(this.options.buttonSelectedClassName);
                if (this.options.buttonSelectedStyle) {
                    Object.assign(this.element.style, this.options.buttonSelectedStyle);
                }
            } else {
                this.element.classList.remove(this.options.buttonSelectedClassName);
                if (this.options.buttonSelectedStyle) {
                    this.element.removeAttribute('style');
                    if (this.options.buttonStyle)
                        Object.assign(this.element.style, this.options.buttonStyle);
                }
            }
        }
    }

    /**
     * Indicates whether the toolbar button is currently visible.
     * Returns `true` if the button's element is not hidden (`display` is not set to `'none'`), otherwise returns `false`.
     */
    get visible(): boolean {
        return this.element?.style.display !== 'none';
    }

    /**
     * Sets the visibility of the toolbar button element.
     * Accepts a CSS display value as a string or a boolean.
     * If a boolean is provided, `true` sets the display to 'inline-block', and `false` sets it to 'none'.
     * If a string is provided, it is used directly as the CSS display value.
     *
     * @param style - The desired visibility state, either as a CSS display string or a boolean.
     */
    set visible(style: string | boolean) {
        if (this.element) {
            if (typeof style === 'boolean') {
                style = style ? 'inline-block' : 'none';
            }
            this.element.style.display = style
        }
    }

    /**
     * Applies custom styles to the toolbar button and its SVG child element, if provided in the options.
     *
     * - If `options.buttonStyle` is defined, it merges the style properties into the button's element.
     * - If `options.svgStyle` is defined, it merges the style properties into the first child element (assumed to be an SVG).
     *
     * @private
     */
    private _styleButton = (): void => {
        if (this.element) {
            if (this.options.buttonStyle) {
                Object.assign(this.element.style, this.options.buttonStyle);
            }
            if (this.options.svgStyle) {
                const childElement = this.element.children[0] as HTMLElement; // Type assertion
                if (childElement) {
                    Object.assign(childElement.style, this.options.svgStyle);
                }
            }
        }
    }

}