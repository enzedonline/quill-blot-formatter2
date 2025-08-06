import Action from './Action';
import BlotFormatter from '../BlotFormatter';
import ToolbarButton from './toolbar/ToolbarButton';
import { CompressorOptions } from '../Options';

type CompressModal = {
    element: HTMLDivElement;
    moreInfoButton: HTMLButtonElement;
    continueButton: HTMLButtonElement;
    cancelButton: HTMLButtonElement;
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

/**
 * CompressAction provides an interactive UI and logic for compressing images embedded in a Quill editor.
 * 
 * This action enables users to reduce the file size of images by resizing and re-encoding them as JPEGs,
 * while preserving the aspect ratio and respecting user-defined options such as maximum width and JPEG quality.
 * 
 * Key features:
 * - Determines image eligibility for compression (must be a data URL, not SVG or GIF).
 * - Parses image dimensions from HTML attributes, supporting various units (px, %, em, rem).
 * - Calculates image size from base64 data URLs.
 * - Presents a modal dialog for user interaction, including prompts, more info, and feedback.
 * - Handles image compression via canvas resizing and JPEG encoding.
 * - Updates the image in the editor if compression is successful and provides feedback on size reduction.
 * - Cleans up resources and UI elements when the action is destroyed.
 * 
 * Usage:
 * - Instantiate with a BlotFormatter instance.
 * - Call `onCreate` to initialize and update toolbar button visibility.
 * - Call `onDestroy` to clean up when the action is no longer needed.
 * 
 * @remarks
 * This class is intended for use within the Quill Blot Formatter extension and assumes integration with its toolbar and modal infrastructure.
 */
export default class CompressAction extends Action {
    options: CompressorOptions;
    modal: CompressModal;
    targetElement: HTMLElement | null | undefined = null;
    imageDetails: ImageDetails | null = null;

    /**
     * Determines whether the given HTML element is eligible for image compression.
     *
     * Eligibility criteria:
     * - The element must be an `<img>` tag.
     * - The image source must be a data URL (`data:image/`).
     * - The image must not be an SVG (`svg+xml`) or GIF (`gif`).
     *
     * @param targetElement - The HTML element to check for compression eligibility.
     * @returns `true` if the element is an eligible image for compression, otherwise `false`.
     */
    static isEligibleForCompression = (targetElement: HTMLElement | null | undefined, debug: boolean = false): boolean => {
        // Must be image tag with data url and not gif or svg
        let isEligible = false;
        if (targetElement instanceof HTMLImageElement) {
            if (targetElement.src.startsWith("data:image/")) {
                const mimeType = targetElement.src.substring(5, targetElement.src.indexOf(";"));
                isEligible = mimeType !== "svg+xml" && mimeType !== "gif";
            }
        }
        if (debug) {
            console.debug('Image eligibility check:', {
                element: targetElement,
                isEligible
            });
        }
        return isEligible;
    }

    constructor(formatter: BlotFormatter) {
        super(formatter);
        this.options = this.formatter.options.image.compressorOptions;
        this.toolbarButtons = [
            new ToolbarButton(
                'compress',
                this._onClickHandler,
                this.formatter.options.toolbar,
            )
        ]
        this.modal = this._createModal();
    }

    /**
     * Initializes the CompressAction by setting the target element and updating the initial visibility
     * of the first toolbar button based on whether the target element is eligible for compression.
     *
     * This method should be called when the action is created. It ensures that the toolbar button
     * reflects the current eligibility state of the target element.
     */
    onCreate = (): void => {
        this.targetElement = this.formatter.currentSpec?.getTargetElement();
        // class should not be instantiated if not eligible - double check here
        const isEligibleForCompression = CompressAction.isEligibleForCompression(this.targetElement, this.debug);
        this.toolbarButtons[0].initialVisibility = isEligibleForCompression;
        if (this.debug) {
            console.debug('CompressAction initialized with target element:', this.targetElement, 'is eligible:', isEligibleForCompression);
        }
    }

    /**
     * Cleans up resources when the action is destroyed.
     * Sets the target element to null and hides the modal dialog.
     */
    onDestroy = (): void => {
        this.targetElement = null;
        this._hideModal();

        this.modal.continueButton.removeEventListener('click', this._onContinueClick);
        this.modal.moreInfoButton.removeEventListener('click', this._onMoreInfoClick);
        this.modal.cancelButton.removeEventListener('click', this._hideModal);
        this.modal.element.removeEventListener('pointerdown', this._onBackgroundClick);
    }

    /**
     * Handles the click event for the compress action.
     * When triggered, it displays the modal dialog for compression options.
     *
     * @param event - The click event object.
     */
    private _onClickHandler: EventListener = () => {
        this._showModal();
    }

    /**
     * Displays a modal dialog for image compression if the target element is an image.
     * If the image can be compressed, shows additional information and appends the modal to the document body.
     * Otherwise, displays feedback indicating that no compression is possible.
     *
     * @private
     */
    private _showModal = (): void => {
        if (this.targetElement instanceof HTMLImageElement) {
            this.imageDetails = this._getImageDetails(this.targetElement);
            if (this.imageDetails.canCompress) {
                this.modal.moreInfoButton.style.visibility = 'visible';
                this.modal.moreInfoText.style.display = 'none';
                document.body.append(this.modal.element);
            } else {
                this._displayFeedback(this.options.text.nothingToDo);
            }
        }
    }

    /**
     * Removes the modal element from the DOM, effectively hiding the modal.
     *
     * @private
     */
    private _hideModal = (): void => {
        this.modal.element.remove();
    }

    /**
     * Parses the `width` and `height` attributes of an HTMLImageElement and returns their numeric values.
     * Handles values specified in pixels (`px`), percentages (`%`), em/rem units, or plain numbers.
     * If the attribute is a percentage, uses the maximum width from options if available.
     * For em/rem units, assumes 16px per unit.
     * If the height is not specified or cannot be parsed, attempts to calculate it using the aspect ratio
     * from the image's natural dimensions if width is available.
     * 
     * @param img - The HTMLImageElement whose dimensions are to be parsed.
     * @returns A tuple containing the parsed width and height as numbers, or `null` if parsing fails.
     */
    private _parseDimensions = (img: HTMLImageElement): [number | null, number | null] => {
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

    /**
     * Calculates the approximate byte size of an image from its data URL.
     *
     * @param img - The HTMLImageElement whose size is to be determined.
     * @returns The size of the image in bytes if the `src` attribute is a valid base64-encoded data URL,
     *          or `null` if the `src` is not a valid image data URL or does not contain base64 data.
     */
    private _getImageSize = (img: HTMLImageElement): number | null => {
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

    /**
     * Displays a feedback message in the formatter's sizeInfo element.
     * The message is shown with full opacity, then fades out after 2.5 seconds.
     *
     * @param msg - The feedback message to display.
     */
    private _displayFeedback = (msg: string): void => {
        this.formatter.sizeInfo.innerHTML = msg;
        this.formatter.sizeInfo.style.transition = '';
        this.formatter.sizeInfo.style.opacity = '1';
        setTimeout(() => {
            this.formatter.sizeInfo.style.transition = 'opacity 1s';
            this.formatter.sizeInfo.style.opacity = '0';
        }, 2500);
    }

    /**
     * Retrieves detailed information about an image element, including its natural and target dimensions,
     * file size, and whether it is eligible for compression based on the provided options.
     *
     * @param img - The HTMLImageElement to extract details from.
     * @returns An {@link ImageDetails} object containing the image's natural and target dimensions,
     *          file size, and compression eligibility.
     */
    private _getImageDetails = (img: HTMLImageElement): ImageDetails => {
        let [width, height] = this._parseDimensions(img);
        if (!width && ((this.options.maxWidth ?? Infinity) < img.naturalWidth)) {
            width = this.options.maxWidth as number;
            height = width / (img.naturalWidth / img.naturalHeight);
        }
        const details = {
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            targetWidth: width,
            targetHeight: height,
            size: this._getImageSize(img) as number,
            canCompress: !!(width && height && (width < img.naturalWidth) && CompressAction.isEligibleForCompression(img, this.debug))
        }
        if (this.debug) {
            console.debug('Image details:', {
                element: img,
                ...details,
            });
        }
        return details;
    }

    /**
     * Compresses a given HTMLImageElement by resizing it to target dimensions and reducing its quality.
     * If compression results in a smaller image, the image's `src` is updated with the compressed data URL.
     * Displays feedback about the compression result, including size reduction and new dimensions.
     *
     * @param img - The HTMLImageElement to compress.
     * @returns `true` if the compression process was initiated, `false` if image loading failed.
     *
     * @remarks
     * - Compression only occurs if `imageDetails.canCompress` is `true`.
     * - The image is resized to `imageDetails.targetWidth` and `imageDetails.targetHeight`.
     * - JPEG quality is determined by `options.jpegQuality`.
     * - Feedback is displayed using `_displayFeedback`.
     * - If compression is not possible, a "nothing to do" message is shown.
     */
    private _compressImage = (img: HTMLImageElement): boolean => {
        if (this.imageDetails?.canCompress) {
            const newImg = new Image();
            newImg.src = img.src;
            // Once the image has loaded, resize it
            newImg.onload = () => {
                if (this.debug) {
                    console.debug('Compressing Image Copy loaded:', newImg);
                }
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
                const sizeDiff: string = `${Math.ceil((this.imageDetails!.size - (this._getImageSize(img) as number)) / 1024)}kB`
                const msg: string = `${this.options.text.reducedLabel}: ${sizeDiff}<br>
                            ${this.imageDetails!.naturalWidth} x ${this.imageDetails!.naturalHeight}px → ${canvas.width} x ${Math.round(canvas.height)}px
                        `;
                if (this.debug) {
                    console.debug('Image compressed:', {
                        'original size': originalSize,
                        'resized size': resizedSize,
                        'size diff': sizeDiff,
                        'new dimensions': { width: canvas.width, height: Math.round(canvas.height) }
                    });
                }
                this._displayFeedback(msg);
                return true;
            };
            newImg.onerror = (error) => {
                console.error('Image loading failed:', error);
                this._displayFeedback(`Image loading failed: ${error}`);
                return false;
            };
        } else {
            this._displayFeedback(this.options.text.nothingToDo);
        };
        return true;
    }

    /**
     * Creates and configures a modal dialog for the compress action.
     *
     * The modal includes a prompt, an optional "more info" section, and three buttons:
     * Cancel, More Info, and Continue. Styles and content are applied based on the
     * provided options. Event listeners are attached to handle user interactions:
     * - Continue: triggers image compression and hides the modal.
     * - More Info: displays additional information and hides the button.
     * - Cancel: hides the modal.
     * - Clicking the background: hides the modal if the background itself is clicked.
     *
     * @returns {CompressModal} An object containing the modal background element,
     *          the "More Info" button, and the "More Info" text element.
     */
    private _createModal = (): CompressModal => {
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
            Object.assign(cancelButton.style, { ...this.options.styles.buttons, ...this.options.buttons.cancel.style });
            if (this.options.text.moreInfo) {
                Object.assign(moreInfoButton.style, { ...this.options.styles.buttons, ...this.options.buttons.moreInfo.style });
            } else {
                moreInfoButton.style.visibility = 'hidden';
            }
            Object.assign(continueButton.style, { ...this.options.styles.buttons, ...this.options.buttons.continue.style });
        }
        cancelButton.innerHTML = this.options.icons.cancel;
        moreInfoButton.innerHTML = this.options.icons.moreInfo;
        continueButton.innerHTML = this.options.icons.continue;

        // event listeners
        continueButton.addEventListener('click', this._onContinueClick);
        moreInfoButton.addEventListener('click', this._onMoreInfoClick);
        cancelButton.addEventListener('click', this._hideModal);
        modalBackground.addEventListener('pointerdown', this._onBackgroundClick);
        return {
            element: modalBackground,
            moreInfoButton: moreInfoButton,
            cancelButton: cancelButton,
            continueButton: continueButton,
            moreInfoText: modalMoreInfo,
        }
    }

    private _onContinueClick = (): void => {
        if (this.targetElement instanceof HTMLImageElement) {
            this._compressImage(this.targetElement);
        }
        this._hideModal();
    }

    private _onMoreInfoClick = (): void => {
        this.modal.moreInfoText.innerHTML = this.options.text.moreInfo || '';
        this.modal.moreInfoText.style.display = 'block';
        this.modal.moreInfoButton.style.visibility = 'hidden';
    }

    private _onBackgroundClick = (event: PointerEvent) => {
        event.stopImmediatePropagation();
        if (event.target === this.modal.element) {
            if (this.debug) {
                console.debug('Modal background clicked, hiding modal');
            }
            this._hideModal();
        }
    }

}