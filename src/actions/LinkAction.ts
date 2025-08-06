import Action from './Action';
import BlotFormatter from '../BlotFormatter';
import Quill from 'quill';
import ToolbarButton from './toolbar/ToolbarButton';
import type { Blot } from '../specs/BlotSpec';
import type { LinkOptions } from '../Options';

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
export default class LinkAction extends Action {
    targetElement: HTMLElement | null | undefined = null;
    currentBlot: Blot | null | undefined = null;
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
    }

    constructor(formatter: BlotFormatter) {
        super(formatter);
        this.linkOptions = this.formatter.options.image.linkOptions;
        this.toolbarButton = new ToolbarButton(
            'link',
            this._onClickHandler,
            this.formatter.options.toolbar
        );
        // override preselect method to show button active if img has link on load
        this.toolbarButton.preselect = () => {
            return !!this.getLink();
        };
        this.toolbarButtons = [this.toolbarButton];
        (window as any).LinkAction = this; // For debugging purposes
    }

    /**
     * Initializes the action by setting the `targetElement` property.
     * Retrieves the target element from the current formatter specification, if available.
     * This method is typically called when the action is created.
     */
    onCreate = (): void => {
        this.targetElement = this.formatter.currentSpec?.getTargetElement();
        this.currentBlot = this.formatter.currentSpec?.getTargetBlot();
    }

    /**
     * Cleans up resources when the action is destroyed.
     * - Sets the target element to null.
     * - Removes any attached event listeners.
     * - Hides the link modal if it is visible.
     */
    onDestroy = (): void => {
        this.targetElement = null;
        this._removeEventListeners();
        this.hideLinkModal();
    }

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
    private _addEventListeners = (): void => {
        if (this.modal) {
            this.modal.form.addEventListener('submit', this._formSubmitHandler);
            this.modal.cancelButton.addEventListener('click', this.hideLinkModal);
            this.modal.removeButton.addEventListener('click', this.removeLink);
            this.modal.background.addEventListener('click', this._onBackgroundClick);
            this.modal.input.addEventListener('contextmenu', this._trapContextEvent);
        }
    }

    /**
     * Removes all event listeners attached to the modal elements.
     * 
     * This method detaches event handlers from the modal's dialog, form, input,
     * cancel button, remove button, background, and input context menu to prevent
     * memory leaks and unintended behavior when the modal is no longer in use.
     * 
     * @private
     */
    private _removeEventListeners = (): void => {
        if (this.modal) {
            this.modal.form.removeEventListener('submit', this._formSubmitHandler);
            this.modal.cancelButton.removeEventListener('click', this.hideLinkModal);
            this.modal.removeButton.removeEventListener('click', this.removeLink);
            this.modal.background.removeEventListener('click', this._onBackgroundClick);
            this.modal.input.removeEventListener('contextmenu', this._trapContextEvent);
        }
    }

    /**
     * Prevents the event from propagating further in the event chain.
     * This method is typically used to trap context menu or similar events,
     * ensuring that no other event listeners are triggered for the same event.
     *
     * @param e - The event to be stopped.
     */
    private _trapContextEvent = (e: Event): void => {
        e.stopImmediatePropagation();
    }

    /**
     * Event handler that is triggered when the associated element is clicked.
     * Invokes the `showLinkModal` method to display the link editing modal.
     *
     * @private
     * @remarks
     * This handler is typically bound to a UI element to allow users to edit or add links.
     */
    private _onClickHandler: EventListener = (): void => {
        this.showLinkModal();
    }

    /**
     * Handles click events on the modal background.
     * 
     * If the click event's target is the modal background, this method prevents the default behavior,
     * stops the event from propagating further, and hides the link modal.
     *
     * @param e - The mouse event triggered by the user's click.
     */
    private _onBackgroundClick = (e: MouseEvent): void => {
        if (e.target === this.modal?.background) {
            e.stopImmediatePropagation();
            e.preventDefault();
            this.hideLinkModal();
            if (this.debug) {
                console.debug('LinkAction modal background clicked, hiding modal');
            }   
        }
    }

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
    showLinkModal = (): void => {
        if (this.targetElement) {
            this.modal = this._buildModal();
            if (!this.modal) return;

            this.formatter.overlay.append(this.modal.dialog, this.modal.background);
            this._addEventListeners();

            // Hide to prevent flicker and force layout
            this.modal.dialog.style.visibility = 'hidden';
            this.modal.dialog.show();
            this._positionModal(this.modal.dialog);
            // Show after positioning
            this.modal.dialog.style.visibility = "visible";
            // Focus the input field
            this.modal.input.focus();
            this.modal.input.select();
        }
    }

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
    private _buildModal = (): typeof this.modal => {
        const dialog = document.createElement('dialog');
        dialog.className = this.linkOptions.modal.dialog.className;
        dialog.dataset.blotFormatterModal = '';
        Object.assign(dialog.style, this.linkOptions.modal.dialog.style);

        // Create form
        const form = document.createElement('form');
        form.method = 'dialog';
        form.className = this.linkOptions.modal.form.className;
        Object.assign(form.style, this.linkOptions.modal.form.style);

        // Label
        const label = document.createElement('label');
        label.htmlFor = 'link-url';
        label.textContent = this.linkOptions.modal.label.text;
        label.className = this.linkOptions.modal.label.className;
        Object.assign(label.style, this.linkOptions.modal.label.style);

        // Input
        const input = document.createElement('input');
        input.type = 'url';
        input.id = 'link-url';
        input.name = 'url';
        input.value = this.getLink() || '';
        input.select();
        input.autofocus = true;
        input.className = this.linkOptions.modal.input.className;
        Object.assign(input.style, this.linkOptions.modal.input.style);
        input.placeholder = this.linkOptions.modal.input.placeholder || '';

        // OK button
        const okButton = document.createElement('button');
        okButton.type = 'submit';
        okButton.innerHTML = this.linkOptions.modal.buttons.submit.icon;
        okButton.className = this.linkOptions.modal.buttons.submit.className;
        Object.assign(okButton.style, this.linkOptions.modal.buttons.submit.style);

        // Cancel button
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.innerHTML = this.linkOptions.modal.buttons.cancel.icon;
        cancelButton.className = this.linkOptions.modal.buttons.cancel.className;
        Object.assign(cancelButton.style, this.linkOptions.modal.buttons.cancel.style);

        // Remove button
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.innerHTML = this.linkOptions.modal.buttons.remove.icon;
        removeButton.className = this.linkOptions.modal.buttons.remove.className;
        Object.assign(removeButton.style, this.linkOptions.modal.buttons.remove.style);

        // Append modal
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(okButton);
        form.appendChild(removeButton);
        form.appendChild(cancelButton);
        dialog.appendChild(form);

        // Background mask
        const background = document.createElement('div');
        background.className = this.linkOptions.modal.background.className || '';
        Object.assign(background.style, this.linkOptions.modal.background.style);

        return {
            dialog,
            background,
            form,
            label,
            input,
            okButton,
            cancelButton,
            removeButton
        };
    }

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
    private _positionModal = (dialog: HTMLDialogElement): void => {
        const overlayRect = this.formatter.overlay.getBoundingClientRect();
        const quillRect = this.formatter.quill.root.getBoundingClientRect();
        const offsetParentRect = dialog.offsetParent?.getBoundingClientRect() ?? { top: 0, left: 0 };

        const dialogWidth = dialog.offsetWidth;
        const dialogHeight = dialog.offsetHeight;

        // Center horizontally relative to overlay
        let left = overlayRect.left + overlayRect.width / 2 - dialogWidth / 2 - offsetParentRect.left;
        let top = overlayRect.top + overlayRect.height / 2 - dialogHeight / 2 - offsetParentRect.top;

        // Clamp left to stay within quill root, in same coordinate space
        const minLeft = quillRect.left - offsetParentRect.left;
        const maxLeft = quillRect.right - dialogWidth - offsetParentRect.left;
        left = Math.min(Math.max(left, minLeft), maxLeft);

        const minTop = quillRect.top - offsetParentRect.top;
        const maxTop = quillRect.bottom - dialogHeight - offsetParentRect.top;
        top = Math.min(Math.max(top, minTop), maxTop);

        // Apply positioning
        dialog.style.position = "absolute";
        dialog.style.left = `${left}px`;
        dialog.style.top = `${top}px`;
    }

    /**
     * Hides and cleans up the link modal dialog.
     *
     * This method closes and removes the modal dialog and its background overlay if they exist,
     * removes any associated event listeners, and resets the modal reference to undefined.
     */
    hideLinkModal = (): void => {
        if (this.modal?.dialog?.open) this.modal.dialog.close();
        this.modal?.dialog?.remove();
        if (this.modal?.background)
            this.modal.background.remove();
        this._removeEventListeners();
        this.modal = undefined;
    }

    /**
     * Handles the form submission event for the link action.
     * 
     * Prevents the default form submission behavior, extracts the URL from the form data,
     * and applies or removes a link on the current blot based on the URL's presence.
     *
     * @param event - The form submission event.
     */
    private _formSubmitHandler = (event: Event): void => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const url = (formData.get('url') as string).trim();
        if (this.debug) {
            console.debug('LinkAction form submitted with URL:', url);
        }
        if (this.currentBlot) {
            if (url) {
                this.applyLink(url);
            } else {
                this.removeLink();
            }
        }
    }

    /**
     * Retrieves the link format associated with the current blot, if any.
     *
     * @returns {any | null} The link URL if the current blot has a link format, otherwise `null`.
     *
     * @remarks
     * This method checks if the current blot exists and has a DOM node. It then retrieves the index of the blot
     * in the Quill editor and fetches its formats. If a link format is present, it returns the link value; otherwise, it returns `null`.
     */
    getLink = (): any => {
        const blot = this.currentBlot;
        if (!blot || !blot.domNode) return null;
        const index = this.formatter.quill.getIndex(blot);
        const formats = this.formatter.quill.getFormat(index, 1, Quill.sources.SILENT);
        if (this.debug) {
            console.debug('LinkAction getLink called, formats:', formats);
        }
        return formats.link || null;
    }

    /**
     * Removes the link format from the current image blot's parent wrapper, if present.
     * 
     * Traverses up the blot hierarchy from the current image blot to find a parent blot
     * with a 'link' format. If found, it removes the link format from that wrapper.
     * After removing the link, it hides the link modal and deselects the toolbar button.
     *
     * @returns {void}
     */
    removeLink = (): void => {
        const imageBlot = this.currentBlot;
        if (!imageBlot || !imageBlot.domNode) return;
        let wrapperBlot = imageBlot.parent;
        // Traverse upward until we find the inline wrapper with the link format
        while (wrapperBlot && typeof wrapperBlot.formats === 'function') {
            const formats = wrapperBlot.formats();
            if (formats.link) {
                wrapperBlot.format('link', null);
                break;
            }
            wrapperBlot = wrapperBlot.parent;
        }
        if (this.debug) {
            console.debug('LinkAction removeLink called, removed link from blot:', wrapperBlot);
        }
        this.hideLinkModal();
        this.toolbarButton.selected = false;
    }

    /**
     * Applies a link to the current blot if the provided URL is different from the existing link.
     * Removes any existing link, formats the current blot with the new link, and updates the toolbar button state.
     * Hides the link modal after applying the link.
     *
     * @param url - The URL to apply as a link to the current blot.
     */
    applyLink = (url: string): void => {
        if (url !== this.getLink()) {
            this.removeLink();
            this.currentBlot?.format('link', url);
            this.toolbarButton.selected = (!!url);
        }
        this.hideLinkModal();
    }
}