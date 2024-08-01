import Quill from 'quill';
import Action from './Action';
import BlotFormatter from '../BlotFormatter';
import type { Blot } from '../specs/BlotSpec';
import { ImageAlign } from './align/AlignFormats';

export default class AttributeAction extends Action {
    icon: string;

    constructor(formatter: BlotFormatter) {
        super(formatter);
        this.icon = this.formatter.options.align.icons.attribute
    }

    setAltTitle(alt: string, title: string): void {
        const targetElement = this.formatter.currentSpec?.getTargetElement();
        if (targetElement) {
            if (alt) { targetElement.setAttribute('alt', alt); }
            if (title) {
                targetElement.setAttribute('title', title);
            }
            // Update format if applied
            const blot = Quill.find(targetElement) as Blot | null;
            const imageAlignment = blot?.parent?.formats()[ImageAlign.attrName]?.align;
            if (blot && imageAlignment) {
                blot.parent?.format(ImageAlign.attrName, false)
                blot.format(
                    ImageAlign.attrName,
                    {
                        align: imageAlignment,
                        title: title
                    }
                );
            }
        }
    }

    showAltTitleModal(clickEvent: MouseEvent): void {
        const uuid: string = Array.from(crypto.getRandomValues(new Uint8Array(5)), (n) =>
            String.fromCharCode(97 + (n % 26))
        ).join('');
        document.body.insertAdjacentHTML('beforeend', this.modalHTML(uuid));
        const modal: HTMLElement | null = document.getElementById(`${uuid}-modal`);
        const cancelButton: HTMLElement | null = document.getElementById(`${uuid}-cancel`);
        const form: HTMLFormElement = document.getElementById(`${uuid}-form`) as HTMLFormElement;
        const targetElement = this.formatter.currentSpec?.getTargetElement();

        if (modal && form) {
            const elements = form.elements as HTMLFormControlsCollection;
            const altInput = elements.namedItem('alt') as HTMLTextAreaElement;
            const titleInput = elements.namedItem('title') as HTMLTextAreaElement;

            altInput.value = targetElement?.getAttribute('alt') || ''
            titleInput.value = targetElement?.getAttribute('title') || ''
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                this.setAltTitle(altInput.value, titleInput.value);
                modal.remove();
            });
            form.addEventListener('cancel', () => { modal.remove(); })
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.remove();
                }
            });
            cancelButton?.addEventListener('click', () => { modal.remove(); })
        }
    }

    modalHTML(uuid: string): string {
        return `
        <div id="${uuid}-modal" data-blot-formatter-modal
            style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999">
            <div style="background-color: #f2f2f2; padding: 10px; border-radius: 5px; position: relative; width: 90%; max-width: 500px;">
                <form id="${uuid}-form" style="margin-block-end: 0;">
                    <label style="color: black; display: block;" for="alt">
                    <h6 style="color: black; margin: 0; padding-bottom: 5px !important;">${this.formatter.options.overlay.labels.alt}</h6>
                    </label>
                    <textarea style="background-color: white; display: block; resize: none; width: 100%; padding: 5px;" name="alt" rows="3"></textarea>
                    <label style="display: block; margin-top: 10px;" for="title">
                    <h6 style="color: black; margin: 0; padding-bottom: 5px !important;">${this.formatter.options.overlay.labels.title}</h6>
                    </label>
                    <textarea style="background-color: white; display: block; resize: none; width: 100%; padding: 5px;" name="title" rows="3"></textarea>
                    <div style="text-align: right;">
                        <button type="submit" style="margin-top: 5px; font-size: x-large; text-decoration: none; font-weight:bold; color: green; cursor: pointer; background: none; border: 0; padding: 0;">✓</button>
                    </div>
                </form>
                <button id="${uuid}-cancel" type="cancel" style="position: absolute; top: -0.5em; right: -0.5em; padding: 0 2px 2px 2px; background: white; border: 1px solid gray; border-radius: 5px; color: red; cursor: pointer;">🗙</button>
            </div>
        </div>
        `;
    }
}
