import Action from './Action';
import { Blot } from '../specs/BlotSpec';

/**
 * Provides caret (text cursor) manipulation actions for the Quill editor, including moving the caret
 * backward, placing the caret before or after a specified blot, and handling keyboard navigation events.
 *
 * This class is designed to work with the Quill editor and the Blot Formatter overlay, enabling precise
 * caret placement and navigation around custom blots (such as images or embeds) within the editor.
 *
 * @remarks
 * - Integrates with the Quill editor instance and its formatting specifications.
 * - Handles keyboard events to facilitate intuitive caret movement for users.
 * - Ensures proper event listener management to prevent memory leaks.
 *
 * @public
 */
export default class CaretAction extends Action {

  /**
   * Moves the caret (text cursor) backward by a specified number of characters within the current selection.
   *
   * If the caret is at the beginning of a text node, it attempts to move to the end of the previous sibling text node.
   * If there is no previous sibling or the selection is not valid, the caret position remains unchanged.
   *
   * @param n - The number of characters to move the caret back. Defaults to 1.
   */
  static sendCaretBack = (n = 1, debug = false): void => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const currentNode = range.startContainer;
      const currentOffset = range.startOffset;

      // Move the cursor back by n characters
      if (currentOffset > 0) {
        range.setStart(currentNode, currentOffset - n);
      } else if (currentNode.previousSibling) {
        // Move to end of previous text node
        const prevNode = currentNode.previousSibling;
        if (prevNode.nodeType === Node.TEXT_NODE) {
          range.setStart(prevNode, prevNode.textContent?.length || 0);
        }
      }

      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      if (debug) {
        console.debug('Caret moved back by', n, 'characters');
      }
    }
  }

  /**
   * Places the caret (text cursor) immediately before the specified blot in the Quill editor.
   *
   * @param quill - The Quill editor instance.
   * @param targetBlot - The blot before which the caret should be placed.
   */
  static placeCaretBeforeBlot = (quill: any, targetBlot: Blot, debug = false): void => {
    const index = quill.getIndex(targetBlot);
    quill.setSelection(index, 0, "user");
    if (debug) {
      console.debug('Caret placed before blot at index:', index, targetBlot);
    }
  }

  /**
   * Places the caret (text cursor) immediately after the specified blot in the Quill editor.
   *
   * This method first clears any existing selection and ensures the editor is focused.
   * It then calculates the index of the target blot and determines whether it is the last blot in the document.
   * - If the target blot is the last one, the caret is placed at the very end of the document.
   * - Otherwise, the caret is positioned just after the target blot, using a combination of Quill's selection API
   *   and a native browser adjustment to avoid placing the caret inside a formatting span wrapper.
   *
   * @param quill - The Quill editor instance.
   * @param targetBlot - The blot after which the caret should be placed.
   */
  static placeCaretAfterBlot = (quill: any, targetBlot: Blot, debug = false): void => {
    quill.setSelection(null); // Clear selection first
    quill.root.focus(); // Ensure the editor is focused
    const index = quill.getIndex(targetBlot);
    const documentLength = quill.getLength();

    // Check if this is the last blot in the document
    if (index + 1 >= documentLength - 1) {
      // For the last blot, place cursor at the very end
      quill.setSelection(documentLength - 1, 0, "user");
      if (debug) {
        console.debug('Caret placed at the end of the document after blot:', targetBlot);
      }
    } else {
      // overshoot by one then use native browser API to send caret back one
      // without this, caret will be placed inside formatting span wrapper
      if (debug) {
        console.debug('Caret placed after character following blot at index:', index, targetBlot);
      } 
      quill.setSelection(index + 2, 0, "user");
      this.sendCaretBack(1, debug); // Move cursor back by 1 character
    }
  }

  /**
   * Initializes event listeners for the CaretAction.
   *
   * Adds a 'keyup' event listener to the document and an 'input' event listener
   * to the Quill editor's root element. Both listeners trigger the `onKeyUp` handler.
   *
   * @remarks
   * This method should be called when the action is created to ensure proper
   * caret handling and formatting updates in response to user input.
   */
  onCreate = (): void => {
    document.addEventListener('keyup', this.onKeyUp);
    this.formatter.quill.root.addEventListener('input', this.onKeyUp);
  }

  /**
   * Cleans up event listeners attached by this action.
   *
   * Removes the 'keyup' event listener from the document and the 'input' event listener
   * from the Quill editor's root element to prevent memory leaks and unintended behavior
   * after the action is destroyed.
   */
  onDestroy = (): void => {
    document.removeEventListener('keyup', this.onKeyUp);
    this.formatter.quill.root.removeEventListener('input', this.onKeyUp);
  }

  /**
   * Handles the keyup event for caret navigation around a target blot in the editor.
   *
   * - If a modal is open or there is no current formatting specification, the handler exits early.
   * - If the left arrow key is pressed, places the caret before the target blot and hides the formatter UI.
   * - If the right arrow key is pressed, places the caret after the target blot and hides the formatter UI.
   *
   * @param e - The keyboard event triggered by the user's keyup action.
   */
  onKeyUp = (e: KeyboardEvent) => {
    const modalOpen: boolean = !!document.querySelector('[data-blot-formatter-modal]')
    if (!this.formatter.currentSpec || modalOpen) {
      return;
    }
    const targetBlot = this.formatter.currentSpec.getTargetBlot();
    if (!targetBlot) {
      return;
    }

    // if left arrow, place cursor before targetBlot
    // if right arrow, place cursor after targetBlot
    if (e.code === 'ArrowLeft') {
      CaretAction.placeCaretBeforeBlot(this.formatter.quill, targetBlot, this.debug);
      this.formatter.hide();
    } else if (e.code === 'ArrowRight') {
      CaretAction.placeCaretAfterBlot(this.formatter.quill, targetBlot, this.debug);
      this.formatter.hide();
    }
  };
}
