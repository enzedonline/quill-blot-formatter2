import Action from './Action';
import BlotFormatter from '../BlotFormatter';
import ToolbarButton from './toolbar/ToolbarButton';
import type { Blot } from '../specs/BlotSpec';

interface AltTitleModal {
    element: HTMLDivElement;
    form: HTMLFormElement;
    altInput: HTMLTextAreaElement;
    titleInput: HTMLTextAreaElement;
    cancelButton: HTMLButtonElement;
}

export default class AttributeAction extends Action {
    modal: AltTitleModal;
    targetElement: HTMLElement | null | undefined = null;
    currentBlot: Blot | null | undefined = null;

    constructor(formatter: BlotFormatter) {
        super(formatter);
        this.toolbarButtons = [
            new ToolbarButton(
                'attribute',
                this._onClickHandler,
                this.formatter.options.toolbar,
            )
        ]
        this.modal = this._createModal();
    }

    /**
     * Initializes the target element and current blot for the action.
     * Retrieves the target element and blot from the current formatter specification.
     *
     * @remarks
     * This method should be called when the action is created to ensure
     * that the necessary references are set up for further processing.
     */
    onCreate = (): void => {
        this.targetElement = this.formatter.currentSpec?.getTargetElement();
        this.currentBlot = this.formatter.currentSpec?.getTargetBlot();
    }

    /**
     * Cleans up resources when the action is destroyed.
     * Sets the target element to null and removes the modal element from the DOM.
     */
    onDestroy = (): void => {
        this.targetElement = null;
        this.modal.form.removeEventListener('submit', this._onSubmitHandler);
        this.modal.form.removeEventListener('cancel', this._hideAltTitleModal);
        this.modal.element.removeEventListener('pointerdown', this._onPointerDownHandler);
        this.modal.cancelButton.removeEventListener('click', this._hideAltTitleModal);
        this.modal.element.remove();
    }

    /**
     * Event handler for click events that triggers the display of the Alt Title modal.
     * 
     * @private
     * @remarks
     * This handler is assigned to UI elements to allow users to edit or view the Alt Title attribute.
     */
    private _onClickHandler: EventListener = (): void => {
        this._showAltTitleModal();
    }

    /**
     * Displays the modal for editing the 'alt' and 'title' attributes of the target element.
     * 
     * If a target element is present, this method sets the modal's input fields to the current
     * 'alt' and 'title' attribute values of the target element (or empty strings if not set),
     * and appends the modal element to the document body.
     *
     * @private
     */
    private _showAltTitleModal = (): void => {
        if (this.targetElement) {
            this.modal.altInput.value = this.targetElement.getAttribute('alt') || '';
            this.modal.titleInput.value = this.targetElement.getAttribute('title') || '';
            document.body.append(this.modal.element);
            if (this.formatter.options.debug) {
                console.debug('Showing Alt Title modal for:', this.targetElement);
            }
        }
    }

    /**
     * Hides and removes the alt/title modal from the DOM.
     *
     * This method removes the modal's element, effectively closing the modal UI.
     * It is typically called when the modal should no longer be visible to the user.
     *
     * @private
     */
    private _hideAltTitleModal = (): void => {
        this.modal.element.remove();
    }

    /**
     * Updates the `alt` and `title` attributes of the target image element based on user input.
     * If a title is provided, it sets the `title` attribute; otherwise, it removes it.
     * Additionally, if an image alignment format is applied, it updates the alignment format
     * to include the new title value.
     *
     * @private
     */
    private _setAltTitle = (): void => {
        if (this.targetElement) {
            const alt: string = typeof this.modal.altInput.value === "string" 
                ? this.modal.altInput.value 
                : "";
            const title: string = this.modal.titleInput.value;
            this.targetElement.setAttribute('alt', alt);
            if (title) {
                this.targetElement.setAttribute('title', title);
            } else {
                this.targetElement.removeAttribute('title');
            }
            if (this.formatter.options.debug) {
                console.debug('Setting alt:', alt, 'title:', title, 'on target element:', this.targetElement);
            }
            // Update align format if applied
            const imageAlignment = this.currentBlot?.parent?.formats()[this.formatter.ImageAlign.attrName]?.align;
            if (this.currentBlot && imageAlignment) {
                if (this.formatter.options.debug) {
                    console.debug('Updating title of image with alignment:', imageAlignment);
                }
                // Reapply the existing alignment format if it exists
                this.currentBlot.parent?.format(this.formatter.ImageAlign.attrName, false)
                this.currentBlot.format(
                    this.formatter.ImageAlign.attrName,
                    {
                        align: imageAlignment,
                        title: title
                    }
                );
            }
        }
    }

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
    private _createModal = (): AltTitleModal => {
        const uuid: string = Array.from(crypto.getRandomValues(new Uint8Array(5)), (n) =>
            String.fromCharCode(97 + (n % 26))
        ).join('');

        // Create modal background
        const modal = document.createElement('div');
        modal.id = `${uuid}-modal`;
        modal.setAttribute('data-blot-formatter-modal', '');

        // Create modal container
        const modalContainer = document.createElement('div');

        // Create form element
        const form = document.createElement('form');
        form.id = `${uuid}-form`;

        // Create label for alt
        const labelAlt = document.createElement('label');
        labelAlt.setAttribute('for', 'alt');
        labelAlt.textContent = this.formatter.options.overlay.labels?.alt || this.formatter.options.image.altTitleModalOptions.labels.alt;

        // Create textarea for alt
        const textareaAlt = document.createElement('textarea');
        textareaAlt.name = 'alt';
        textareaAlt.rows = 3;

        // Create label for title
        const labelTitle = document.createElement('label');
        labelTitle.setAttribute('for', 'title');
        labelTitle.textContent = this.formatter.options.overlay.labels?.title || this.formatter.options.image.altTitleModalOptions.labels.title;

        // Create textarea for title
        const textareaTitle = document.createElement('textarea');
        textareaTitle.name = 'title';
        textareaTitle.rows = 3;

        // Create submit button
        const buttonDiv = document.createElement('div');
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.innerHTML = this.formatter.options.image.altTitleModalOptions.icons.submitButton;
        buttonDiv.appendChild(submitButton);

        // Append elements to the form
        form.appendChild(labelAlt);
        form.appendChild(textareaAlt);
        form.appendChild(labelTitle);
        form.appendChild(textareaTitle);
        form.appendChild(buttonDiv);

        // Create cancel button
        const cancelButton = document.createElement('button');
        cancelButton.id = `${uuid}-cancel`;
        cancelButton.type = 'button';
        cancelButton.innerHTML = this.formatter.options.image.altTitleModalOptions.icons.cancelButton;

        // styles
        if (this.formatter.options.image.altTitleModalOptions.styles) {
            Object.assign(modal.style, this.formatter.options.image.altTitleModalOptions.styles.modalBackground);
            Object.assign(modalContainer.style, this.formatter.options.image.altTitleModalOptions.styles.modalContainer);
            Object.assign(labelAlt.style, this.formatter.options.image.altTitleModalOptions.styles.label);
            Object.assign(textareaAlt.style, this.formatter.options.image.altTitleModalOptions.styles.textarea);
            Object.assign(labelTitle.style, this.formatter.options.image.altTitleModalOptions.styles.label);
            Object.assign(textareaTitle.style, this.formatter.options.image.altTitleModalOptions.styles.textarea);
            Object.assign(submitButton.style, this.formatter.options.image.altTitleModalOptions.styles.submitButton);
            Object.assign(cancelButton.style, this.formatter.options.image.altTitleModalOptions.styles.cancelButton);
        }

        // Append form and cancel button to the modal container
        modalContainer.appendChild(form);
        modalContainer.appendChild(cancelButton);

        // Append modal container to the modal background
        modal.appendChild(modalContainer);

        // event listeners
        form.addEventListener('submit', this._onSubmitHandler);
        form.addEventListener('cancel', this._hideAltTitleModal);
        modal.addEventListener('pointerdown', this._onPointerDownHandler);
        cancelButton.addEventListener('click', this._hideAltTitleModal);

        return {
            element: modal,
            form: form,
            altInput: textareaAlt,
            titleInput: textareaTitle,
            cancelButton: cancelButton
        };
    }

    private _onSubmitHandler = (event: SubmitEvent): void => {
        event.preventDefault();
        this._setAltTitle();
        this._hideAltTitleModal();
    }

    private _onPointerDownHandler = (event: PointerEvent): void => {
        if (event.target === this.modal.element) {
            this._hideAltTitleModal();
        }
    }
}
