

import BlotFormatter from '../BlotFormatter';
import Action from '../actions/Action';
import AlignAction from '../actions/align/AlignAction';
import ResizeAction from '../actions/ResizeAction';
import DeleteAction from '../actions/DeleteAction';

export interface Blot {
  length(): number;
}

export default class BlotSpec {
  formatter: BlotFormatter;

  constructor(formatter: BlotFormatter) {
    this.formatter = formatter;
  }

  init(): void {}

  getActions(): Array<Action> {
    return [
      new AlignAction(this.formatter),
      new ResizeAction(this.formatter),
      new DeleteAction(this.formatter)
    ];
  }

  getTargetElement(): HTMLElement | null {
    return null;
  }

  getOverlayElement(): HTMLElement | null {
    return this.getTargetElement();
  }

  setSelection(): void {
    this.formatter.quill.setSelection(null);
  }

  onHide() {}
}
