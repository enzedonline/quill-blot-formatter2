import Quill from 'quill';

export default class TooltipContainPosition {
  /**
   * Repositions a tooltip element within a given container to ensure it does not overflow
   * the container's boundaries. Adjusts the tooltip's `top` and `left` CSS properties if
   * necessary to keep it fully visible. Optionally logs debug information about the repositioning.
   *
   * @param tooltip - The tooltip HTMLDivElement to reposition.
   * @param container - The container HTMLElement within which the tooltip should remain visible.
   * @param debug - If true, logs debug information to the console. Defaults to false.
   */
  private static _repositionTooltip = (tooltip: HTMLDivElement, container: HTMLElement, debug = false) => {
    const tooltipRect = tooltip.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate position relative to the container
    let left = tooltipRect.left - containerRect.left;
    let top = tooltipRect.top - containerRect.top;
    const width = tooltipRect.width;
    const height = tooltipRect.height;
    const maxWidth = container.clientWidth;
    const maxHeight = container.clientHeight;

    let changed = false;
    const newStyles: { top?: string; left?: string } = {};

    // 1) Top overflow 
    if (top < 0) {
      newStyles.top = `${tooltipRect.height}px`;
      changed = true;
    }

    // 2) Bottom overflow
    if (top + height > maxHeight) {
      newStyles.top = `${maxHeight - height}px`;
      changed = true;
    }

    // 3) Left overflow
    if (left < 0) {
      newStyles.left = '0px';
      changed = true;
    }

    // 4) Right overflow
    if (left + width > maxWidth) {
      newStyles.left = `${maxWidth - width}px`;
      changed = true;
    }

    if (changed) {
      if (debug) {
        console.debug('Repositioning tooltip', newStyles);
      }

      // Apply all style changes at once to minimize mutations
      if (newStyles.top !== undefined) {
        tooltip.style.top = newStyles.top;
      }
      if (newStyles.left !== undefined) {
        tooltip.style.left = newStyles.left;
      }

      if (tooltip.classList.contains('ql-flip')) {
        tooltip.classList.remove('ql-flip');
      }
    } else {
      if (debug) {
        console.debug('Tooltip position is fine, no changes needed');
      }
    }
  }
  
  // Static property to store observers
  private static observers = new WeakMap<HTMLDivElement, MutationObserver>();

  /**
   * Observes changes to the tooltip's attributes and triggers repositioning when necessary.
   *
   * @param quill - The Quill editor instance containing the tooltip.
   * @param debug - Optional flag to enable debug logging of attribute mutations.
   *
   * @remarks
   * Uses a MutationObserver to monitor changes to the tooltip's `style` and `class` attributes.
   * When a mutation is detected, the tooltip is repositioned within the container.
   * If `debug` is true, mutation details are logged to the console.
   */
  static watchTooltip(quill: Quill, debug = false): void {
    const tooltip = quill.container.querySelector('.ql-tooltip') as HTMLDivElement;
    const container = quill.container;
    if (!tooltip) {
      console.warn('No tooltip found to watch for adjustments.');
      return;
    }
    // Clean up any existing observer for this tooltip
    this.removeTooltipWatcher(tooltip, debug);

    let isRepositioning = false;

    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      // Ignore mutations caused by our own repositioning
      if (isRepositioning) return;

      if (debug) {
        for (const m of mutations) {
          console.debug('Tooltip mutation:', m.attributeName, tooltip.getAttribute(m.attributeName!));
        }
      }

      isRepositioning = true;
      this._repositionTooltip(tooltip, container, debug);
      // Use setTimeout to reset the flag after the current execution context
      setTimeout(() => {
        isRepositioning = false;
      }, 0);
    });

    observer.observe(tooltip, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    // Store the observer for later cleanup
    this.observers.set(tooltip, observer);
  }

  /**
   * Removes the MutationObserver for the specified tooltip element.
   *
   * @param tooltip - The HTMLDivElement or Quill instance to stop watching.
   *                  If a Quill instance is provided, finds the tooltip within its container.
   */
  static removeTooltipWatcher(tooltip: HTMLDivElement | Quill, debug = false): void {
    let tooltipElement: HTMLDivElement | null = null;

    if (tooltip instanceof HTMLDivElement) {
      tooltipElement = tooltip;
    } else {
      // Assume it's a Quill instance
      tooltipElement = tooltip.container.querySelector('.ql-tooltip') as HTMLDivElement;
    }

    if (tooltipElement && this.observers.has(tooltipElement)) {
      const observer = this.observers.get(tooltipElement);
      observer?.disconnect();
      this.observers.delete(tooltipElement);
      if (debug) {
        console.debug('Tooltip watcher removed for:', tooltipElement);
      }
    }
  }

  /**
   * Initializes the tooltip adjustment watcher when the action is created.
   * Searches for the tooltip element within the Quill container and, if found,
   * sets up observation for tooltip adjustments. Logs a warning if the tooltip
   * element is not present.
   *
   * @remarks
   * This method should be called during the creation lifecycle of the action.
   */
  constructor(private readonly quill: Quill, private readonly debug = false) {
    const tooltip = quill.container.querySelector('.ql-tooltip') as HTMLDivElement;
    console.debug('tooltip:', tooltip);
    if (tooltip) {
      TooltipContainPosition.watchTooltip(quill, debug);
      if (debug) {
        console.debug('Tooltip watcher initialized for:', tooltip);
      }
    } else {
      console.warn('No tooltip found to watch for adjustments.');
    }
  }

  /**
   * Cleans up resources when the action is destroyed.
   * Specifically, it finds the tooltip element within the Quill editor container
   * and removes its associated watcher if the tooltip exists.
   */
  destroy = (): void => {
    const tooltip = this.quill.container.querySelector('.ql-tooltip') as HTMLDivElement;
    if (tooltip) {
      TooltipContainPosition.removeTooltipWatcher(this.quill, this.debug);
      if (this.debug) {
        console.debug('Tooltip watcher removed on destroy');
      }
    }
  }

}
