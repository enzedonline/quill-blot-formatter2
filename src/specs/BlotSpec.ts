import Action from '../actions/Action';
import AlignAction from '../actions/align/AlignAction';
import BlotFormatter from '../BlotFormatter';
import CaretAction from '../actions/CaretAction';
import DeleteAction from '../actions/DeleteAction';
import ResizeAction from '../actions/ResizeAction';

export interface Blot {
  domNode: HTMLElement;
  parent: Blot | null;
  next: Blot | null;
  prev: Blot | null;
  statics: any | null;
  format(name: string, value: any): void | undefined;
  formats(): { [key: string]: any };
  length(): number;
}

/**
 * Abstract base class representing a specification for a Quill blot.
 *
 * `BlotSpec` provides a framework for defining custom blot behaviors and actions
 * within the Quill editor. Subclasses can override methods to implement specific
 * initialization, action handling, and element targeting logic for different blot types.
 *
 * @remarks
 * - Designed to be extended by concrete blot specification classes.
 * - Manages formatter instance and provides utility methods for blot manipulation.
 *
 * @example
 * ```typescript
 * class ImageBlotSpec extends BlotSpec {
 *   // Custom implementation for image blots
 * }
 * ```
 *
 * @property formatter - The `BlotFormatter` instance associated with this spec.
 * @property isUnclickable - Indicates whether the blot is unclickable.
 *
 * @method init - Initializes the blot specification. Intended to be overridden.
 * @method getActions - Returns an array of enabled `Action` objects for the current formatter. Intended to be extended.
 * @method getTargetElement - Returns the target HTML element for the blot. Intended to be overridden.
 * @method getTargetBlot - Retrieves the target blot associated with the current selection.
 * @method getOverlayElement - Returns the overlay element associated with the blot.
 * @method setSelection - Clears the current selection in the Quill editor.
 * @method onHide - Callback invoked when the blot is hidden. Intended to be overridden.
 */
export default class BlotSpec {
  // abstract class for Blot specifications

  formatter: BlotFormatter;
  isUnclickable: boolean = false;

  constructor(formatter: BlotFormatter) {
    this.formatter = formatter;
  }

  /**
   * Initializes the blot specification.
   *
   * This method is intended to perform any setup required for the blot spec.
   * It can be overridden by subclasses to provide specific initialization logic.
   * 
   */
  init = (): void => {}

  /**
   * Returns an array of `Action` instances based on the formatter's configuration options.
   * 
   * The returned actions may include:
   * - `AlignAction` if aligning is allowed (`options.align.allowAligning`)
   * - `ResizeAction` if resizing is allowed (`options.resize.allowResizing`)
   * - `DeleteAction` if keyboard deletion is allowed (`options.delete.allowKeyboardDelete`)
   * - Always includes `CaretAction`
   *
   * It can be overridden by subclasses to provide additional actions specific to the blot type.
   * 
   * @returns {Array<Action>} An array of enabled `Action` objects for the current formatter.
   */
  getActions(): Array<Action> {
    const actions: Array<Action> = [];
    if (this.formatter.options.align.allowAligning) {
      actions.push(new AlignAction(this.formatter));
    }
    if (this.formatter.options.resize.allowResizing) {
      actions.push(new ResizeAction(this.formatter));
    }
    if (this.formatter.options.delete.allowKeyboardDelete) {
      actions.push(new DeleteAction(this.formatter));
    }
    actions.push(new CaretAction(this.formatter));

    return actions;
  }

  /**
   * Returns the target HTML element associated with this blot.
   * 
   * This method is intended to be overridden by subclasses to provide the specific target element
   * for the blot type.
   *
   * @returns {HTMLElement | null} The target element, or `null` if none exists.
   */
  getTargetElement = (): HTMLElement | null => {
    return null;
  }

  /**
   * Retrieves the target blot associated with the current selection.
   *
   * This method first obtains the target DOM element using `getTargetElement()`.
   * If a target element exists, it uses the Quill instance to find and return the corresponding blot.
   * If no target element is found, it returns `null`.
   * 
   * @remarks
   * This method uses the quill instance constructor to overcome issue encountered with `Quill.find()`
   * with certain environments where the `Quill` global differs from the one used in the quill instance.
   * In those cases, the `find()` method will always return `null`. These environments include: vite,
   * react and angular.
   *
   * @returns {Blot | null} The blot corresponding to the target element, or `null` if not found.
   */
  getTargetBlot = (): Blot | null => {
    const target = this.getTargetElement();
    if (!!target) {
      return this.formatter.Quill.find(target) as Blot | null;
    } else {
      return null;
    }
  }

  /**
   * Returns the overlay element associated with the blot.
   * 
   * @returns {HTMLElement | null} The overlay element, or `null` if none exists.
   */
  getOverlayElement = (): HTMLElement | null => {
    return this.getTargetElement();
  }

  /**
   * Clears the current selection in the Quill editor by setting it to `null`.
   * This effectively removes any active text selection.
   *
   * @remarks
   * Useful for resetting the editor's selection state, such as after formatting actions.
   */
  setSelection = (): void => {
    this.formatter.quill.setSelection(null);
  }

  /**
   * Callback invoked when the blot is hidden.
   * Override this method to implement custom hide behavior.
   */
  onHide = (): void => {}
}
