import Action from '../actions/Action';
import AttributeAction from '../actions/AttributeAction';
import BlotFormatter from '../BlotFormatter';
import BlotSpec from './BlotSpec';
import CompressAction from '../actions/CompressAction';
import LinkAction from '../actions/LinkAction';

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
export default class ImageSpec extends BlotSpec {
  img: HTMLElement | null;

  constructor(formatter: BlotFormatter) {
    super(formatter);
    this.img = null;
  }

  /**
   * Initializes the image spec by attaching a click event listener to the Quill editor's root element.
   * The event listener triggers the `onClick` handler when the root element is clicked.
   */
  init = (): void => {
    this.formatter.quill.root.addEventListener('click', this.onClick);
  }

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
  getActions = (): Array<Action> => {
    const actions = super.getActions();
    if (this.formatter.options.image.linkOptions.allowLinkEdit) {
      actions.push(new LinkAction(this.formatter));
    }
    if (this.formatter.options.image.allowAltTitleEdit) {
      actions.push(new AttributeAction(this.formatter));
    }
    if (this.formatter.options.image.allowCompressor && CompressAction.isEligibleForCompression(this.img)) {
      actions.push(new CompressAction(this.formatter));
    }
    return actions;
  }

  /**
   * Returns the target HTML element associated with this instance.
   *
   * @returns {HTMLElement | null} The image element if available, otherwise `null`.
   */
  getTargetElement = (): HTMLElement | null => {
    return this.img;
  }

  /**
   * Handles the hide event by resetting the image reference to null.
   * This is typically called when the overlay should no longer be displayed or interacted with.
   */
  onHide = (): void => {
    this.img = null;
  }

  /**
   * Handles click events on image elements.
   * 
   * If the clicked element is an HTMLImageElement, prevents the default behaviour
   * (such as opening links), stores a reference to the image, and displays the formatter UI.
   * 
   * @param event - The mouse event triggered by the click.
   */
  onClick = (event: MouseEvent): void => {
    const el = event.target;
    if (this.formatter.enabled && el instanceof HTMLImageElement) {
      // prevent <a> links from opening
      event.stopImmediatePropagation();
      event.preventDefault();
      this.img = el;
      this.formatter.show(this);
    }
  };
}
