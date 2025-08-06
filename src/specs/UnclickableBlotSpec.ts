import BlotFormatter from '../BlotFormatter';
import BlotSpec from './BlotSpec';

const PROXY_IMAGE_CLASS = 'blot-formatter__proxy-image';

type UnclickableProxy = {
  unclickable: HTMLElement;
  proxyImage: HTMLElement;
};
type UnclickableProxies = Record<string, UnclickableProxy>;

/**
 * Represents a Quill BlotSpec for managing "unclickable" elements within the editor.
 * 
 * This class overlays transparent proxy images on unclickable HTML elements (such as videos)
 * to intercept user interactions and enable custom formatting behaviour. It tracks proxies,
 * synchronizes their positions with the underlying elements, and manages event listeners
 * for editor changes, scrolling, and resizing.
 * 
 * Key Features:
 * - Automatically creates and removes proxy overlays for unclickable elements.
 * - Repositions proxies on editor scroll and resize events.
 * - Handles click events on proxies to trigger formatter overlays.
 * - Passes through wheel and touch events for smooth scrolling.
 * 
 * @remarks
 * - Proxies are managed using a randomly generated ID stored in the element's dataset.
 * - The proxy container is appended to the Quill editor's container and holds all proxy images.
 * - Designed to work with Quill's BlotFormatter extension for custom video or media formatting.
 * 
 * @extends BlotSpec
 */
export default class UnclickableBlotSpec extends BlotSpec {
  selector: string;
  unclickable: HTMLElement | null;
  proxyContainer: HTMLElement;
  unclickableProxies: UnclickableProxies;
  isUnclickable: boolean = true;

  constructor(formatter: BlotFormatter) {
    super(formatter);
    this.selector = formatter.options.video.selector;
    this.unclickable = null;
    this.proxyContainer = this._createProxyContainer();
    this.unclickableProxies = {};
  }

  /**
   * Initializes event listeners and observers for unclickable blot proxies.
   * - Sets up a listener for Quill's 'text-change' event to handle updates.
   * - Adds a scroll event listener to the Quill root to reposition proxy images when scrolling occurs.
   * - Observes editor resize events to maintain correct proxy positioning.
   */
  init = (): void => {
    // create unclickable proxies, position proxies over unclickables
    this.formatter.quill.on('text-change', this._onTextChange);
    // reposition proxy image if quill root scrolls (only if target is child of quill root)
    this.formatter.quill.root.addEventListener('scroll', () => {
      this._repositionProxyImages();
    });
    this._observeEditorResize();
  }

  /**
   * Observes the Quill editor's root element for resize events and triggers repositioning
   * of proxy images when the editor's dimensions change (e.g., due to screen resize or editor grow/shrink).
   * Uses a debounced approach to avoid excessive repositioning by waiting 200ms after the last resize event.
   *
   * @remarks
   * This method sets up a `ResizeObserver` on the editor's root element and calls
   * `_repositionProxyImages` whenever a resize is detected, with debouncing to improve performance.
   */
  private _observeEditorResize = (): void => {
    // reposition proxies if editor dimensions change (e.g. screen resize or editor grow/shrink)
    let resizeTimeout: number | null = null;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Clear the previous timeout if there was one
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        // Set a new timeout to run after 200ms
        resizeTimeout = window.setTimeout(() => {
          this._repositionProxyImages();
        }, 200);
      }
    });
    // Start observing the element for size changes
    resizeObserver.observe(this.formatter.quill.root);
  }

  /**
   * Returns the target HTML element associated with this instance.
   * 
   * @returns {HTMLElement | null} The unclickable HTML element, or `null` if not set.
   */
  getTargetElement = (): HTMLElement | null => {
    return this.unclickable;
  }

  /**
   * Returns the overlay HTML element associated with the blot, or `null` if none exists.
   *
   * @returns {HTMLElement | null} The unclickable overlay element, or `null` if not set.
   */
  getOverlayElement = (): HTMLElement | null => {
    return this.unclickable;
  }

  /**
   * Handles changes to the text content within the Quill editor.
   *
   * This method performs the following actions:
   * 1. Checks if any "unclickable" elements tracked by proxies have been deleted from the editor.
   *    If so, it removes their corresponding proxy images and cleans up the tracking object.
   * 2. Searches for new "unclickable" elements that do not yet have a proxy image and creates proxies for them.
   * 3. Repositions all proxy images to ensure they are correctly aligned with their associated elements.
   *
   * This method is intended to be called whenever the editor's content changes to keep proxy images in sync.
   */
  private _onTextChange = (): void => {
    // check if any unclickable has been deleted, remove proxy if so
    Object.entries(this.unclickableProxies).forEach(([key, { unclickable, proxyImage }]) => {
      try {
        if (!this.formatter.quill.root.contains(unclickable)) {
          proxyImage.remove();
          delete this.unclickableProxies[key];
        }
      } catch { }
    });
    // add proxy for any new unclickables
    this.formatter.quill.root.querySelectorAll(`${this.selector}:not([data-blot-formatter-id])`)
      .forEach((unclickable: HTMLElement) => {
        this._createUnclickableProxyImage(unclickable);
      });
    this._repositionProxyImages();
  };

  /**
   * Creates a transparent proxy image overlay for an unclickable HTML element.
   * The proxy image is linked to the unclickable element via a randomly generated ID,
   * which is stored in the element's dataset and used as a key in the `unclickableProxies` record.
   * The proxy image is styled to be absolutely positioned and unselectable, and is appended to the proxy container.
   * Event listeners are attached to the proxy image to handle click, context menu, wheel, and touch events,
   * allowing interaction to be managed or passed through as needed.
   *
   * @param unclickable - The target HTMLElement to overlay with a transparent proxy image.
   */
  private _createUnclickableProxyImage = (unclickable: HTMLElement): void => {
    const id = Array.from(crypto.getRandomValues(new Uint8Array(5)), (n) =>
      String.fromCharCode(97 + (n % 26))
    ).join('');
    unclickable.dataset.blotFormatterId = id;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.globalAlpha = 0;
      context.fillRect(0, 0, 1, 1);
    }

    const proxyImage = document.createElement('img');
    proxyImage.src = canvas.toDataURL('image/png');
    proxyImage.classList.add(PROXY_IMAGE_CLASS);
    proxyImage.dataset.blotFormatterId = id;

    const mergedStyle: Record<string, any> = {
      ...this.formatter.options.video.proxyStyle,
      ...{
        position: 'absolute',
        margin: '0',
        userSelect: 'none',
      }
    }

    Object.assign(proxyImage.style, mergedStyle);

    proxyImage.style.setProperty('-webkit-user-select', 'none');
    proxyImage.style.setProperty('-moz-user-select', 'none');
    proxyImage.style.setProperty('-ms-user-select', 'none');

    if (this.formatter.options.debug) {
      proxyImage.style.setProperty('border', '3px solid red');
    }

    this.proxyContainer.appendChild(proxyImage);

    // on click, hide proxy, show overlay
    proxyImage.addEventListener('click', this._onProxyImageClick);
    // disable context menu on proxy
    proxyImage.addEventListener('contextmenu', (event) => {
      event.stopPropagation();
      event.preventDefault();
    });
    // scroll the quill root on pointer wheel event & touch scroll
    proxyImage.addEventListener('wheel', this.formatter._passWheelEventThrough);
    proxyImage.addEventListener('touchstart', this.formatter._onTouchScrollStart, { passive: false });
    proxyImage.addEventListener('touchmove', this.formatter._onTouchScrollMove, { passive: false });

    // used to reposition proxy and identify target unclickable
    this.unclickableProxies[id] = {
      unclickable: unclickable,
      proxyImage: proxyImage
    }

    if (this.formatter.options.debug) {
      console.debug('UnclickableBlotSpec created proxy for unclickable:', unclickable, 'with ID:', id, 'and proxy image:', proxyImage);
    }
  }

  /**
   * Repositions proxy images to overlay their corresponding "unclickable" elements
   * within the Quill editor container. Calculates each unclickable element's position
   * relative to the container, accounting for scroll offsets, and updates the proxy image's
   * style properties (`left`, `top`, `width`, `height`) accordingly.
   *
   * Handles errors gracefully by logging any issues encountered during positioning.
   *
   * @private
   */
  private _repositionProxyImages = (): void => {
    if (Object.keys(this.unclickableProxies).length > 0) {
      const containerRect: DOMRect = this.formatter.quill.container.getBoundingClientRect();
      const containerScrollLeft: number = this.formatter.quill.container.scrollLeft;
      const containerScrollTop: number = this.formatter.quill.container.scrollTop;

      Object.entries(this.unclickableProxies).forEach(([key, { unclickable, proxyImage }]) => {
        try {
          // Calculate the unclickable's position relative to the container
          const unclickableRect: DOMRect = unclickable.getBoundingClientRect();
          Object.assign(proxyImage.style, {
              // display: 'block',
              left: `${unclickableRect.left - containerRect.left - 1 + containerScrollLeft}px`,
              top: `${unclickableRect.top - containerRect.top + containerScrollTop}px`,
              width: `${unclickableRect.width}px`,
              height: `${unclickableRect.height}px`,
            },
          );
        } catch (error) {
          const msg: string = `Error positioning proxy image with id ${key}: `
          console.error(msg, `${error instanceof Error ? error.message : error}`);
        }
      });
    }
  }


  /**
   * Handles click events on proxy images representing unclickable blots.
   * Retrieves the associated unclickable blot using the proxy's dataset ID,
   * updates the `unclickable` property, and displays the formatter overlay.
   *
   * @param event - The mouse event triggered by clicking the proxy image.
   */
  private _onProxyImageClick = (event: MouseEvent): void => {
    // get target unclickable (unclickable), show overlay
    const targetElement = event.target as HTMLElement;
    const id = targetElement.dataset.blotFormatterId;
    this.unclickable = this.unclickableProxies[`${id}`].unclickable;
    this.formatter.show(this);
  };

  /**
   * Creates a proxy container element (`div`) with the class 'proxy-container' and appends it
   * to the Quill editor's container. This container is used to hold all proxy images.
   *
   * @returns {HTMLElement} The newly created proxy container element.
   * @private
   */
  private _createProxyContainer = (): HTMLElement => {
    // create a child div on quill.container to hold all the proxy images
    const proxyContainer = document.createElement('div');
    proxyContainer.classList.add('proxy-container');
    this.formatter.quill.container.appendChild(proxyContainer);
    return proxyContainer;
  }

}
