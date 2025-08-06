import Action from '../Action';
import BlotFormatter from '../../BlotFormatter';
import DefaultAligner from './DefaultAligner';
import ToolbarButton from '../toolbar/ToolbarButton';
import { Alignment } from './Alignment';

/**
 * Provides alignment actions for Quill editor blots, including creating, managing,
 * and handling alignment toolbar buttons. Integrates with a `DefaultAligner` to
 * apply, clear, and detect alignment on selected blots. Handles UI state for
 * alignment buttons and supports debug logging.
 *
 * @remarks
 * This class is intended to be used as part of a Quill blot formatter extension,
 * enabling users to align embedded content (such as images or videos) via a toolbar.
 *
 * @extends Action
 *
 * @example
 * ```typescript
 * const alignAction = new AlignAction(formatter);
 * alignAction.onCreate();
 * // ... user interacts with toolbar ...
 * alignAction.onDestroy();
 * ```
 */
export default class AlignAction extends Action {
  aligner: DefaultAligner;
  alignButtons: Record<string, ToolbarButton> = {};

  constructor(formatter: BlotFormatter) {
    super(formatter);
    this.aligner = new DefaultAligner(formatter);
    if (formatter.options.debug) console.debug('AlignAction Aligner created:', this.aligner);
  }

  /**
   * Creates alignment toolbar buttons for each available alignment option.
   * 
   * Iterates over the alignments provided by the aligner and creates a `ToolbarButton`
   * for each alignment, storing them in the `alignButtons` map. If there is a currently
   * selected blot, it checks its alignment and preselects the corresponding button.
   * Optionally logs debug information about the created buttons and the current alignment.
   *
   * @private
   */
  private _createAlignmentButtons = (): void => {
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
      if (this.debug) {
        console.debug('AlignAction alignment buttons created:', this.alignButtons);
        console.debug('Blot alignment on load:', alignment);
      }
    }
  }

  /**
   * Clears the selection state of all alignment buttons.
   *
   * Iterates through all buttons in the `alignButtons` collection and sets their
   * `selected` property to `false`. If debugging is enabled, logs a message to the console.
   *
   * @private
   */
  private _clearButtons = (): void => {
    for (const button of Object.values(this.alignButtons)) {
      button.selected = false;
    }
    if (this.debug) console.debug('AlignAction alignment buttons cleared');
  }

  /**
   * Handles click events on alignment toolbar buttons.
   *
   * This event handler determines which alignment action was triggered by the user,
   * retrieves the corresponding alignment configuration, and applies or clears the alignment
   * on the currently selected blot in the editor. It also updates the toolbar button states
   * and logs debug information if enabled.
   *
   * @param event - The click event triggered by the user on a toolbar button.
   */
  onClickHandler: EventListener = (event: Event): void => {
    const button: HTMLElement | null = (event.target as HTMLElement)
      .closest(`span.${this.formatter.options.toolbar.buttonClassName}`);
    if (!!button) {
      const action:string = button.dataset.action || '';
      const targetBlot = this.formatter.currentSpec?.getTargetBlot();
      if (!!action && !!targetBlot) {
        const alignment: Alignment = this.aligner.alignments[action];
        this._clearButtons();
        if (this.aligner.isAligned(targetBlot, alignment)) {
          this.aligner.clear(targetBlot);
          if (this.debug) {
            console.debug('AlignAction clear alignment:', action, targetBlot);
          }
        } else {
          this.aligner.setAlignment(targetBlot, action);
          this.alignButtons[action].selected = true;
          if (this.debug) {
            console.debug('AlignAction set alignment:', action, targetBlot);
          }
        }
      }
    }
    this.formatter.update();
  }

  /**
   * Initializes the alignment action by creating alignment buttons and storing them in the toolbar.
   * If debug mode is enabled in the formatter options, logs the created alignment buttons to the console.
   *
   * @returns {void}
   */
  onCreate = (): void => {
    this._createAlignmentButtons();
    this.toolbarButtons = Object.values(this.alignButtons);
    if (this.formatter.options.debug) console.debug('AlignAction alignment buttons created:', this.toolbarButtons);
  }

  /**
   * Cleans up resources used by the alignment action.
   * 
   * This method resets the `alignButtons` object and clears the `toolbarButtons` array.
   * If debug mode is enabled in the formatter options, a debug message is logged to the console.
   *
   * @returns {void}
   */
  onDestroy = (): void => {
    this.alignButtons = {};
    this.toolbarButtons = [];
    if (this.formatter.options.debug) console.debug('AlignAction alignment buttons destroyed');
  }
}
