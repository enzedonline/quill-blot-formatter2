import Quill from 'quill';
import BlotFormatter from '../BlotFormatter';
import Action from '../actions/Action';
import AlignAction from '../actions/align/AlignAction';
import ResizeAction from '../actions/ResizeAction';
import DeleteAction from '../actions/DeleteAction';

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

export default class BlotSpec {
  formatter: BlotFormatter;
  isUnclickable: boolean = false;

  constructor(formatter: BlotFormatter) {
    this.formatter = formatter;
  }

  init(): void {}

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
    return actions;
  }

  getTargetElement(): HTMLElement | null {
    return null;
  }

  getTargetBlot(): Blot | null {
    const target = this.getTargetElement();
    if (!!target) {
      return Quill.find(target) as Blot | null;
    } else {
      return null;
    }
  }

  getOverlayElement(): HTMLElement | null {
    return this.getTargetElement();
  }

  setSelection(): void {
    this.formatter.quill.setSelection(null);
  }

  onHide() {}
}
