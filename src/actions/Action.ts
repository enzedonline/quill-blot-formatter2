import BlotFormatter from '../BlotFormatter';
import ToolbarButton from './toolbar/ToolbarButton';

/**
 * Represents a base class for actions used within the BlotFormatter.
 * 
 * This class provides a structure for actions that can be performed by the formatter,
 * including lifecycle hooks for creation, destruction, and updates. Subclasses should
 * override the lifecycle methods as needed.
 * 
 * @remarks
 * - Each action holds a reference to the parent `BlotFormatter` instance.
 * - Actions can define their own toolbar buttons by populating the `toolbarButtons` array.
 * - Debug logging is available if the formatter's options enable it.
 * 
 * @example
 * ```typescript
 * class CustomAction extends Action {
 *   onCreate = (): void => {
 *     // Custom initialization logic
 *   }
 *   onDestroy = (): void => {
 *     // Custom destruction logic
 *   }
 *   onUpdate = (): void => {
 *     // Custom update logic
 *   }
 * }
 * ```
 * 
 * @public
 */
export default class Action {
  formatter: BlotFormatter;
  toolbarButtons: ToolbarButton[] = [];
  debug: boolean;

  constructor(formatter: BlotFormatter) {
    this.formatter = formatter;
    this.debug = this.formatter.options.debug || false;
    if (this.debug) console.debug('Action created:', this.constructor.name);
  }

  /**
   * Called when the action is created.
   * Override this method to implement custom initialization logic.
   */
  onCreate = (): void => {}

  /**
   * Called when the action is being destroyed.
   * Override this method to implement custom cleanup logic.
   */
  onDestroy = (): void => {}

  /**
   * Called when the action should be updated.
   * Override this method to implement custom update logic.
   */
  onUpdate = (): void => {}

}
