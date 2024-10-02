import BlotSpec from './BlotSpec';
import BlotFormatter from '../BlotFormatter';
import Action from '../actions/Action';
import AttributeAction from '../actions/AttributeAction';
import CompressAction from '../actions/CompressAction';

export default class ImageSpec extends BlotSpec {
  img: HTMLElement | null;

  constructor(formatter: BlotFormatter) {
    super(formatter);
    this.img = null;
  }

  init() {
    this.formatter.quill.root.addEventListener('click', this.onClick);
  }

  getActions(): Array<Action> {
    const actions = super.getActions();
    if (this.formatter.options.image.allowAltTitleEdit) {
      actions.push(new AttributeAction(this.formatter));
    }
    if (this.formatter.options.image.allowCompressor && CompressAction.isEligibleForCompression(this.img)) {
      actions.push(new CompressAction(this.formatter));
    }
    return actions;
  }

  getTargetElement(): HTMLElement | null {
    return this.img;
  }

  onHide() {
    this.img = null;
  }

  onClick = (event: MouseEvent) => {
    const el = event.target;
    if (el instanceof HTMLImageElement) {
      this.img = el;
      this.formatter.show(this);
    }
  };
}
