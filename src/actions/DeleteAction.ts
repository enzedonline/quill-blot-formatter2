

import Quill from 'quill';
import Action from './Action';

export default class DeleteAction extends Action {
  onCreate() {
    document.addEventListener('keyup', this.onKeyUp, true);
    this.formatter.quill.root.addEventListener('input', this.onKeyUp, true);
  }

  onDestroy() {
    document.removeEventListener('keyup', this.onKeyUp);
    this.formatter.quill.root.removeEventListener('input', this.onKeyUp);
  }

  onKeyUp = (e: KeyboardEvent) => {
    if (!this.formatter.currentSpec) {
      return;
    }

    // delete or backspace
    if (e.code === 'Delete' || e.code === 'Backspace') {
      const targetElement = this.formatter.currentSpec.getTargetElement();
      if (targetElement) {
        const blot = Quill.find(targetElement);
        if (blot) {
          const index = this.formatter.quill.getIndex(blot);
          this.formatter.quill.deleteText(index, 1); // Deletes 1 character from index position
        }
      }
      this.formatter.hide();
    }
  };
}
