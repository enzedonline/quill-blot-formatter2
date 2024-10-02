import Action from './Action';
import BlotFormatter from '../BlotFormatter';
import ToolbarButton from './toolbar/ToolbarButton';
import { CompressorOptions } from '../Options';

type CompressModal = {
    element: HTMLDivElement;
    moreInfoButton: HTMLButtonElement;
    moreInfoText: HTMLDivElement;
}

type ImageDetails = {
    naturalWidth: number;
    naturalHeight: number;
    targetWidth: number | null;
    targetHeight: number | null;
    size: number;
    canCompress: boolean;
}

export default class CompressAction extends Action {
    options: CompressorOptions;
    modal: CompressModal;
    targetElement: HTMLElement | null | undefined = null;
    imageDetails: ImageDetails | null = null;

    constructor(formatter: BlotFormatter) {
        super(formatter);
        this.options = this.formatter.options.image.compressorOptions;
        this.toolbarButtons = [
            new ToolbarButton(
                'compress',
                this.onClickHandler,
                this.formatter.options.toolbar,
            )
        ]
        this.modal = this.createModal();
    }

    onCreate(): void {
        this.targetElement = this.formatter.currentSpec?.getTargetElement();
        // class should not be instantiated is not elibible - double check here
        this.toolbarButtons[0].initialVisibility = CompressAction.isEligibleForCompression(this.targetElement);
    }

    onDestroy(): void {
        this.targetElement = null;
        this.hideModal();
    }

    onClickHandler: EventListener = () => {
        this.showModal();
    }

    showModal(): void {
        if (this.targetElement instanceof HTMLImageElement) {
            this.imageDetails = this.getImageDetails(this.targetElement);
            if (this.imageDetails.canCompress) {
                this.modal.moreInfoButton.style.visibility = 'visible';
                this.modal.moreInfoText.style.display = 'none';
                document.body.append(this.modal.element);
            } else {
                this.displayFeedback(this.options.text.nothingToDo);
            }
        }
    }

    hideModal(): void {
        this.modal.element.remove();
    }

    static isEligibleForCompression(targetElement: HTMLElement | null | undefined): boolean {
        // Must be image tag with data url and not gif or svg
        if (targetElement instanceof HTMLImageElement) {
            if (targetElement.src.startsWith("data:image/")) {
                const mimeType = targetElement.src.substring(5, targetElement.src.indexOf(";"));
                return mimeType !== "svg+xml" && mimeType !== "gif";
            }
        }
        return false;
    }

    parseDimensions(img: HTMLImageElement): [number | null, number | null] {
        let width: string | null = img.getAttribute('width');
        let height: string | null = img.getAttribute('height');
        let parsedWidth: number | null = null;
        let parsedHeight: number | null = null;

        // Parse width
        if (width) {
            if (width.toLowerCase().endsWith('px')) {
                parsedWidth = parseFloat(width);
            } else if (width.endsWith('%')) {
                parsedWidth = this.options.maxWidth ?? null;
            } else if (width.toLowerCase().endsWith('em') || width.toLowerCase().endsWith('rem')) {
                parsedWidth = parseFloat(width) * 16; // assume 16px per unit
            } else if (!isNaN(parseFloat(width))) {
                parsedWidth = parseFloat(width); // Parse as number only if it's plain numeric string
            } else {
                // unknown width attribute, return null to skip resizing
                return [null, null];
            }
        }

        // Parse height
        if (height) {
            if (!isNaN(parseFloat(height))) {
                parsedHeight = parseFloat(height);
            } else if (height.toLowerCase().endsWith('px')) {
                parsedHeight = parseFloat(height);
            } else if (height.toLowerCase().endsWith('em') || height.toLowerCase().endsWith('rem')) {
                parsedHeight = parseFloat(height) * 16; // assume 16px per unit
            } else {
                // use aspect ratio if width is available and natural dimensions are valid
                if (parsedWidth && img.naturalWidth > 0 && img.naturalHeight > 0) {
                    parsedHeight = parsedWidth / (img.naturalWidth / img.naturalHeight);
                } else {
                    return [null, null];
                }
            }
        }

        return [parsedWidth, parsedHeight];
    }

    getImageSize(img: HTMLImageElement): number | null {
        const dataUrl = img.getAttribute('src');
        if (!dataUrl || !dataUrl.startsWith('data:image/')) {
            // Return null if the src is not a valid data URL or doesn't contain image data
            return null;
        }
        // Extract the base64-encoded part of the data URL
        const base64Data = dataUrl.split(',')[1]; // Ignore the data type metadata before the comma
        if (!base64Data) {
            return null;
        }
        // Return the byte size of the base64 string
        return Math.ceil((base64Data.length * 3) / 4);
    }

    displayFeedback(msg: string): void {
        this.formatter.sizeInfo.innerHTML = msg;
        this.formatter.sizeInfo.style.transition = '';
        this.formatter.sizeInfo.style.opacity = '1';
        setTimeout(() => {
            this.formatter.sizeInfo.style.transition = 'opacity 1s';
            this.formatter.sizeInfo.style.opacity = '0';
        }, 2500);
    }

    getImageDetails(img: HTMLImageElement): ImageDetails {
        let [width, height] = this.parseDimensions(img);
        if (!width && ((this.options.maxWidth ?? Infinity) < img.naturalWidth)) {
            width = this.options.maxWidth as number;
            height = width / (img.naturalWidth / img.naturalHeight);
        }
        return {
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            targetWidth: width,
            targetHeight: height,
            size: this.getImageSize(img) as number,
            canCompress: !!(width && height && (width < img.naturalWidth) && CompressAction.isEligibleForCompression(img))
        }
    }

    compressImage = (img: HTMLImageElement): boolean => {
        let result: boolean = false;
        if (this.imageDetails && this.imageDetails.canCompress) {
            const newImg = new Image();
            newImg.src = img.src;
            // Once the image has loaded, resize it
            newImg.onload = () => {
                // Create a canvas element
                const canvas = document.createElement('canvas');
                canvas.width = this.imageDetails!.targetWidth as number;
                canvas.height = this.imageDetails!.targetHeight as number;
                // Draw the image onto the canvas
                const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
                ctx.drawImage(newImg, 0, 0, canvas.width, canvas.height);
                // Get the resized image data URL in JPEG format with a quality of this.options.jpegQuality
                const resizedDataUrl = canvas.toDataURL('image/jpeg', this.options.jpegQuality);
                // Convert data URLs to byte length
                const originalSize = new TextEncoder().encode(img.src).length;
                const resizedSize = new TextEncoder().encode(resizedDataUrl).length;
                // Check if the resized image is smaller than the original
                if (resizedSize < originalSize) {
                    // Set the resized image data URL to the original image
                    img.src = resizedDataUrl;
                }
                const sizeDiff: string = `${Math.ceil((this.imageDetails!.size - (this.getImageSize(img) as number)) / 1024)}kB`
                const msg: string = `${this.options.text.reducedLabel}: ${sizeDiff}<br>
                            ${this.imageDetails!.naturalWidth} x ${this.imageDetails!.naturalHeight}px → ${canvas.width} x ${Math.round(canvas.height)}px
                        `;
                this.displayFeedback(msg);
                return true;
            };
            newImg.onerror = (error) => {
                console.error('Image loading failed:', error);
                this.displayFeedback(`Image loading failed: ${error}`);
                return false;
            };
        } else {
            this.displayFeedback(this.options.text.nothingToDo);
        };
        return true;
    }

    createModal(): CompressModal {
        const modalBackground: HTMLDivElement = document.createElement('div');
        modalBackground.setAttribute('data-blot-formatter-compress-modal', '');
        const modalContainer: HTMLDivElement = document.createElement('div');
        const modalDefaultPrompt: HTMLDivElement = document.createElement('div');
        const modalMoreInfo: HTMLDivElement = document.createElement('div');
        const modalButtonContainer: HTMLDivElement = document.createElement('div');
        const cancelButton: HTMLButtonElement = document.createElement('button');
        const moreInfoButton: HTMLButtonElement = document.createElement('button');
        const continueButton: HTMLButtonElement = document.createElement('button');
        modalMoreInfo.style.display = 'none';
        modalButtonContainer.append(cancelButton, moreInfoButton, continueButton);
        modalContainer.append(modalDefaultPrompt, modalMoreInfo, modalButtonContainer);
        modalBackground.appendChild(modalContainer);
        modalDefaultPrompt.innerHTML = this.options.text.prompt;
        modalMoreInfo.innerHTML = this.options.text.moreInfo || '';
        if (this.options.styles) {
            Object.assign(modalBackground.style, this.options.styles.modalBackground);
            Object.assign(modalContainer.style, this.options.styles.modalContainer);
            Object.assign(modalButtonContainer.style, this.options.styles.buttonContainer);
            Object.assign(cancelButton.style, this.options.styles.buttons);
            if (this.options.text.moreInfo) {
                Object.assign(moreInfoButton.style, this.options.styles.buttons);
            } else {
                moreInfoButton.style.visibility = 'hidden';
            }
            Object.assign(continueButton.style, this.options.styles.buttons);
        }
        cancelButton.innerHTML = this.options.icons.cancel;
        moreInfoButton.innerHTML = this.options.icons.moreInfo;
        continueButton.innerHTML = this.options.icons.continue;

        // event listeners
        continueButton.addEventListener('click', (event) => {
            if (this.targetElement instanceof HTMLImageElement) {
                this.compressImage(this.targetElement);
            }
            this.hideModal();
        });
        moreInfoButton.addEventListener('click', (event) => {
            modalMoreInfo.innerHTML = this.options.text.moreInfo || '';
            modalMoreInfo.style.display = 'block';
            moreInfoButton.style.visibility = 'hidden';
        });
        cancelButton.addEventListener('click', () => { this.hideModal() });
        modalBackground.addEventListener('pointerdown', (event: PointerEvent) => {
            event.stopImmediatePropagation();
            if (event.target === modalBackground) {
                this.hideModal();
            }
        });
        return {
            element: modalBackground,
            moreInfoButton: moreInfoButton,
            moreInfoText: modalMoreInfo
        }
    }



}