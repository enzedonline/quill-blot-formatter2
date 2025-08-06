import BlotFormatter from '../../BlotFormatter';
import ToolbarButton from './ToolbarButton';

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
export default class Toolbar {
    formatter: BlotFormatter;
    element: HTMLElement;
    buttons: Record<string, ToolbarButton> = {};

    constructor(formatter: BlotFormatter) {
        this.formatter = formatter;
        this.element = document.createElement('div');
        this.element.classList.add(this.formatter.options.toolbar.mainClassName);
        this.element.addEventListener('mousedown', (event: MouseEvent) => {
            event.stopPropagation();
        });
        if (this.formatter.options.toolbar.mainStyle) {
            Object.assign(this.element.style, this.formatter.options.toolbar.mainStyle);
        }
    }

    /**
     * Creates and appends toolbar action buttons to the toolbar element. 
     * Called by BlotFormatter.show() to initialize the toolbar.
     * 
     * Iterates through all actions registered in the formatter, collects their toolbar buttons,
     * stores each button in the `buttons` map by its action name, and appends the created button elements
     * to the toolbar's DOM element. Finally, appends the toolbar element to the formatter's overlay.
     */
    create = (): void => {
        const actionButtons: HTMLElement[] = [];
        this.formatter.actions.forEach(action => {
            action.toolbarButtons.forEach(button => {
                this.buttons[button.action] = button;
                actionButtons.push(button.create());
            });
        });
        this.element.append(...actionButtons);
        this.formatter.overlay.append(this.element);
        if (this.formatter.options.debug) {
            console.debug('Toolbar created with buttons:', Object.keys(this.buttons), actionButtons);
        }
    }

    /**
     * Cleans up the toolbar by removing its element from the overlay,
     * destroying all associated buttons, and clearing internal references.
     * Called by BlotFormatter.hide() to remove the toolbar from the DOM.
     * 
     * This should be called when the toolbar is no longer needed to prevent memory leaks.
     */
    destroy = (): void => {
        if (this.element) {
            this.formatter.overlay.removeChild(this.element);
        }
        for (const button of Object.values(this.buttons)) {
            button.destroy();
        }
        this.buttons = {};
        this.element.innerHTML = '';
        if (this.formatter.options.debug) {
            console.debug('Toolbar destroyed');
        }
    }
}