import Quill from 'quill';
import Action from './Action';
import BlotFormatter from '../BlotFormatter';
import type { Blot } from '../specs/BlotSpec';
import { ImageAlign } from './align/AlignFormats';
import ToolbarButton from './toolbar/ToolbarButton';

export default class AttributeAction extends Action {

    constructor(formatter: BlotFormatter) {
        super(formatter);
        if (formatter.options.image.allowAltTitleEdit) {
            this.toolbarButtons = [
                new ToolbarButton(
                    'attribute',
                    this.onClickHandler,
                    this.formatter.options.toolbar,
                )
            ]
        }
    }

    onClickHandler: EventListener = () => {
        this.showAltTitleModal();
    }

    setAltTitle(alt: string, title: string): void {
        const targetElement = this.formatter.currentSpec?.getTargetElement();
        if (targetElement) {
            if (alt) {
                targetElement.setAttribute('alt', alt);
            } else {
                targetElement.removeAttribute('alt');
            }
            if (title) {
                targetElement.setAttribute('title', title);
            } else {
                targetElement.removeAttribute('title');
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

    showAltTitleModal(): void {
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
            modal.addEventListener('pointerdown', (event: PointerEvent) => {
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
                <button id="${uuid}-cancel" type="cancel" style="width: 1.8rem; height: 1.8rem; position: absolute; top: -0.5em; right: -0.5em; padding: 0 2px 2px 2px; background: white; border: 1px solid gray; border-radius: 5px; cursor: pointer;">
                <svg viewBox="0 0 384 512" height="1.2rem" width="1.2rem" style="fill: red;">   
                    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                </svg>
                </button>
            </div>
        </div>
        `;
    }
}
