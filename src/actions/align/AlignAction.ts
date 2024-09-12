import Action from '../Action';
import BlotFormatter from '../../BlotFormatter';
import DefaultAligner from './DefaultAligner';
import ToolbarButton from '../toolbar/ToolbarButton';
import { Alignment } from './Alignment';

export default class AlignAction extends Action {
  aligner: DefaultAligner;
  alignButtons: Record<string, ToolbarButton> = {};

  constructor(formatter: BlotFormatter) {
    super(formatter);
    this.aligner = new DefaultAligner(formatter);
  }

  createAlignmentButtons() {
    for (const alignment of Object.values(this.aligner.alignments)) {
      this.alignButtons[alignment.name] = new ToolbarButton(
        alignment.name,
        this.onClickHandler,
        this.formatter.options.toolbar
      )
    }
    const targetBlot = this.formatter.currentSpec?.getTargetBlot();
    if (targetBlot) {
      const alignment: string | undefined = this.aligner.getAlignment(targetBlot);
      if (alignment && this.alignButtons[alignment]) {
        this.alignButtons[alignment].preselect = () => { return true };
      }
    }
  }

  clearButtons() {
    for (const button of Object.values(this.alignButtons)) {
      button.selected = false;
    }
  }

  onClickHandler: EventListener = (event: Event) => {
    const button: HTMLElement | null = (event.target as HTMLElement).closest(`span.${this.formatter.options.toolbar.buttonClassName}`)
    if (!!button) {
      const action:string = button.dataset.action || '';
      const targetBlot = this.formatter.currentSpec?.getTargetBlot();
      if (!!action && !!targetBlot) {
        const alignment: Alignment = this.aligner.alignments[action];
        this.clearButtons();
        if (this.aligner.isAligned(targetBlot, alignment)) {
          this.aligner.clear(targetBlot);
        } else {
          this.aligner.setAlignment(targetBlot, action);
          this.alignButtons[action].selected = true;
        }
      }
    }
    this.formatter.update();
  }

  onCreate() {
    this.createAlignmentButtons();
    this.toolbarButtons = Object.values(this.alignButtons);
  }

  onDestroy() {
    this.alignButtons = {};
    this.toolbarButtons = [];
  }
}
