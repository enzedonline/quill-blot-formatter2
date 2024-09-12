import BlotFormatter from '../BlotFormatter';
import ToolbarButton from './toolbar/ToolbarButton';

export default class Action {
  formatter: BlotFormatter;
  toolbarButtons: ToolbarButton[] = [];

  constructor(formatter: BlotFormatter) {
    this.formatter = formatter;
  }

  onCreate() {}

  onDestroy() {}

  onUpdate() {}

}
