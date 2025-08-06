import Action from './Action';

/**
 * Represents an action that handles deletion of a selected blot in a Quill editor.
 * 
 * The `DeleteAction` class listens for keyboard and input events to detect when the user
 * presses the 'Delete' or 'Backspace' keys. If a blot is selected and no modal is open,
 * it deletes the corresponding blot from the editor and hides the formatter UI.
 * 
 * @remarks
 * - Event listeners are attached on creation and removed on destruction to prevent memory leaks.
 * - The action only triggers when a blot is selected and no modal dialog with attribute `data-blot-formatter-modal` is open.
 * 
 * @example
 * ```typescript
 * const deleteAction = new DeleteAction(formatter);
 * deleteAction.onCreate();
 * // ... later
 * deleteAction.onDestroy();
 * ```
 */
export default class DeleteAction extends Action {
  /**
   * Initializes event listeners for the delete action.
   * 
   * - Adds a 'keyup' event listener to the document that triggers `_onKeyUp`.
   * - Adds an 'input' event listener to the Quill editor's root element that also triggers `_onKeyUp`.
   * 
   * This method should be called when the delete action is created to ensure
   * proper handling of keyboard and input events.
   */
  onCreate = (): void => {
    document.addEventListener('keyup', this._onKeyUp);
    this.formatter.quill.root.addEventListener('input', this._onKeyUp);
  }

  /**
   * Cleans up event listeners associated with the action.
   * 
   * Removes the 'keyup' event listener from the document and the 'input' event listener
   * from the Quill editor's root element to prevent memory leaks and unintended behavior
   * after the action is destroyed.
   */
  onDestroy = (): void => {
    document.removeEventListener('keyup', this._onKeyUp);
    this.formatter.quill.root.removeEventListener('input', this._onKeyUp);
  }

  /**
   * Handles the keyup event for delete and backspace actions.
   * 
   * If no modal is open and a current spec is selected, checks if the pressed key is
   * 'Delete' or 'Backspace'. If so, finds the target blot element in the Quill editor,
   * determines its index, and deletes one character at that index. Afterwards, hides the formatter UI.
   * 
   * @param e - The keyboard event triggered by the user.
   */
  private _onKeyUp = (e: KeyboardEvent): void => {
    const modalOpen: boolean = !!document.querySelector('[data-blot-formatter-modal]')
    if (!this.formatter.currentSpec || modalOpen) {
      return;
    }
    // delete or backspace
    if (e.code === 'Delete' || e.code === 'Backspace') {
      if (this.debug) {
        console.debug('DeleteAction keyup detected:', e.code);
      }
      // Get the target element from the current spec
      const targetElement = this.formatter.currentSpec.getTargetElement();
      if (targetElement) {
        const blot = this.formatter.Quill.find(targetElement);
        if (blot) {
          const index = this.formatter.quill.getIndex(blot);
          this.formatter.quill.deleteText(index, 1, "user"); // Deletes 1 character from index position
        }
      }
      this.formatter.hide();
    }
  };
}
