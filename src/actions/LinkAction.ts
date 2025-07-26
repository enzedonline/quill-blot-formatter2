import Action from './Action';
import BlotFormatter from '../BlotFormatter';
import Quill from 'quill';
import ToolbarButton from './toolbar/ToolbarButton';
import type { Blot } from '../specs/BlotSpec';
import type { LinkOptions } from '../Options';

export default class LinkAction extends Action {
    targetElement: HTMLElement | null | undefined = null;
    toolbarButton: ToolbarButton;
    currentBlot: Blot | null | undefined
    linkOptions: LinkOptions;
    modal?: {
        dialog: HTMLDialogElement;
        form: HTMLFormElement;
        label: HTMLLabelElement;
        input: HTMLInputElement;
        okButton: HTMLButtonElement;
        cancelButton: HTMLButtonElement;
        removeButton: HTMLButtonElement;
    }

    constructor(formatter: BlotFormatter) {
        super(formatter);
        this.currentBlot = this.formatter.currentSpec?.getTargetBlot();
        this.linkOptions = this.formatter.options.image.linkOptions;
        this.toolbarButton = new ToolbarButton(
            'link',
            this.onClickHandler,
            this.formatter.options.toolbar
        );
        // override preselect method to show button active if img has link on load
        this.toolbarButton.preselect = () => {
            return !!this.getLink(); 
        };
        this.toolbarButtons = [this.toolbarButton];
    }

    onCreate(): void {
        this.targetElement = this.formatter.currentSpec?.getTargetElement();
    }

    onDestroy(): void {
        this.targetElement = null;
        this.removeEventListeners();
        this.hideLinkModal();
    }

    addEventListeners = (): void => {
        if (this.modal) {
            this.modal.dialog.addEventListener('keyup', this.blockKeyEvent);
            this.modal.form.addEventListener('submit', this.formSubmitHandler);
            this.modal.input.addEventListener('input', this.blockKeyEvent);
            this.modal.cancelButton.addEventListener('click', this.hideLinkModal);
            this.modal.removeButton.addEventListener('click', this.removeLink);
            this.modal.dialog.addEventListener('click', this.closeOnOutsideClick);
            this.modal.input.addEventListener('contextmenu', this.trapContextEvent);
        }
    }

    removeEventListeners = (): void => {
        if (this.modal) {
            this.modal.dialog.removeEventListener('keyup', this.blockKeyEvent);
            this.modal.form.removeEventListener('submit', this.formSubmitHandler);
            this.modal.input.removeEventListener('input', this.blockKeyEvent);
            this.modal.cancelButton.removeEventListener('click', this.hideLinkModal);
            this.modal.removeButton.removeEventListener('click', this.removeLink);
            this.modal.dialog.removeEventListener('click', this.closeOnOutsideClick);
            this.modal.input.removeEventListener('contextmenu', this.trapContextEvent);
        }
    }

    blockKeyEvent = (e: Event): void => {
        e.stopImmediatePropagation();
        e.preventDefault();
    }

    trapContextEvent = (e: Event): void => {
        e.stopImmediatePropagation();
    }

    onClickHandler: EventListener = () => {
        this.showLinkModal();
    }

    closeOnOutsideClick = (event: MouseEvent): void => {
        if (event.target === this.modal?.dialog) {
            this.hideLinkModal();
        }
    }

    showLinkModal = (): void => {
        if (this.targetElement) {
            const dialog = document.createElement('dialog');
            dialog.className = this.linkOptions.modal.className;
            dialog.setAttribute('data-blot-formatter-modal', '');
            Object.assign(dialog.style, this.linkOptions.modal.dialogStyle);

            // Create form
            const form = document.createElement('form');
            form.method = 'dialog';
            form.className = this.linkOptions.modal.formClassName;
            Object.assign(form.style, this.linkOptions.modal.formStyle);

            // Label
            const label = document.createElement('label');
            label.htmlFor = 'link-url';
            label.textContent = this.linkOptions.modal.labelText;
            Object.assign(label.style, this.linkOptions.modal.labelStyle);

            // Input
            const input = document.createElement('input');
            input.type = 'url';
            input.id = 'link-url';
            input.name = 'url';
            input.value = this.getLink() || '';
            input.select();
            input.autofocus = true;
            Object.assign(input.style, this.linkOptions.modal.inputStyle);
            input.placeholder = this.linkOptions.modal.inputPlaceholder || '';

            // OK button
            const okButton = document.createElement('button');
            okButton.type = 'submit';
            okButton.innerHTML = this.linkOptions.modal.buttons.submit.icon;
            Object.assign(okButton.style, this.linkOptions.modal.buttons.submit.style);

            // Cancel button
            const cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.innerHTML = this.linkOptions.modal.buttons.cancel.icon;
            Object.assign(cancelButton.style, this.linkOptions.modal.buttons.cancel.style);

            // Remove button
            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.innerHTML = this.linkOptions.modal.buttons.remove.icon;
            Object.assign(removeButton.style, this.linkOptions.modal.buttons.remove.style);

            // Append modal
            form.appendChild(label);
            form.appendChild(input);
            form.appendChild(okButton);
            form.appendChild(removeButton);
            form.appendChild(cancelButton);

            this.modal = {
                dialog,
                form,
                label,
                input,
                okButton,
                cancelButton,
                removeButton
            };

            dialog.appendChild(form);
            this.formatter.overlay.appendChild(dialog);
            this.addEventListeners();
            dialog.showModal();
        }
    }

    hideLinkModal = (): void => {
        if (this.modal?.dialog?.open) this.modal.dialog.close();
        this.modal?.dialog?.remove();
        this.modal = undefined;
    }

    formSubmitHandler = (event: Event): void => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const url = (formData.get('url') as string).trim();

        if (this.currentBlot) {
            if (url) {
                this.applyLink(url);
            } else {
                this.removeLink();
            }
        }
    }

    getLink = (): any => {
        const blot = this.currentBlot;
        if (!blot || !blot.domNode) return null;
        const index = this.formatter.quill.getIndex(blot);
        const formats = this.formatter.quill.getFormat(index, 1, Quill.sources.SILENT);
        return formats.link || null;
    }

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
        this.hideLinkModal();
        this.toolbarButton.selected = false;
    }

    applyLink = (url: string): void => {
        if (url !== this.getLink()) {
            this.removeLink();
            this.currentBlot?.format('link', url);
            this.toolbarButton.selected = (!!url);
        }
        this.hideLinkModal();
    }
}