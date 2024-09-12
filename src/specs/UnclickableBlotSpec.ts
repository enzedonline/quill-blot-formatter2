import BlotSpec from './BlotSpec';
import BlotFormatter from '../BlotFormatter';

const PROXY_IMAGE_CLASS = 'blot-formatter__proxy-image';

type UnclickableProxy = {
  unclickable: HTMLElement;
  proxyImage: HTMLElement;
};
type UnclickableProxies = Record<string, UnclickableProxy>;

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
    this.proxyContainer = this.createProxyContainer();
    this.unclickableProxies = {};
  }

  init() {
    // create unclickable proxies, position proxies over unclickables
    this.formatter.quill.on('text-change', this.onTextChange);
    // reposition proxy image if quill root scrolls (only if target is child of quill root)
    this.formatter.quill.root.addEventListener('scroll', () => {
      this.repositionProxyImages();
    });
    this.observeEditorResize();
  }

  observeEditorResize() {
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
          this.repositionProxyImages();
        }, 200);
      }
    });
    // Start observing the element for size changes
    resizeObserver.observe(this.formatter.quill.root);
  }

  passWheelEventThrough = (event: WheelEvent) => {
    // Manually scroll the quill root element if proxy receives wheel event
    this.formatter.passWheelEventThrough(event);
    this.repositionProxyImages();
  };

  getTargetElement(): HTMLElement | null {
    return this.unclickable;
  }

  getOverlayElement(): HTMLElement | null {
    return this.unclickable;
  }

  onHide = () => {
    this.unclickable = null;
  }

  onTextChange = () => {
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
        this.createUnclickableProxyImage(unclickable);
      });
    this.repositionProxyImages();
  };

  createUnclickableProxyImage(unclickable: HTMLElement): void {
    // create transparent image to overlay unclickable (unclickable)
    // proxies linked via random id used as key in this.unclickableProxies record set
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

    this.proxyContainer.appendChild(proxyImage);

    // on click, hide proxy, show overlay
    proxyImage.addEventListener('click', this.onProxyImageClick);
    // disable context menu on proxy
    proxyImage.addEventListener('contextmenu', (event) => {
      event.stopPropagation();
      event.preventDefault();
    });
    // scroll the quill root on pointer wheel event & touch scroll
    proxyImage.addEventListener('wheel', this.formatter.passWheelEventThrough);
    proxyImage.addEventListener('touchstart', this.formatter.onTouchScrollStart, { passive: false });
    proxyImage.addEventListener('touchmove', this.formatter.onTouchScrollMove, { passive: false });

    // used to reposition proxy and identify target unclickable
    this.unclickableProxies[id] = {
      unclickable: unclickable,
      proxyImage: proxyImage
    }
  }

  repositionProxyImages(): void {
    if (Object.keys(this.unclickableProxies).length > 0) {      
      // Get the scroll positions of the document
      const docScrollTop: number = window.scrollY;
      const docScrollLeft: number = window.scrollX;
      // Get the scroll positions of the quill container and its ancestors
      const containerRect: DOMRect = this.formatter.quill.container.getBoundingClientRect();
      let scrollTop: number = 0;
      let scrollLeft: number = 0;
      let element: HTMLElement | null = this.formatter.quill.container;
      while (element) {
        scrollTop += element.scrollTop;
        scrollLeft += element.scrollLeft;
        element = element.parentElement;
      }

      Object.entries(this.unclickableProxies).forEach(([key, { unclickable, proxyImage }]) => {
        try {
          // Calculate the unclickable's position relative to the container
          const unclickableRect: DOMRect = unclickable.getBoundingClientRect();
          const unclickableTopRelativeToDoc: number = unclickableRect.top + docScrollTop;
          const unclickableLeftRelativeToDoc: number = unclickableRect.left + docScrollLeft;
          const unclickableTopRelativeToContainer: number = unclickableTopRelativeToDoc - containerRect.top - scrollTop;
          const unclickableLeftRelativeToContainer: number = unclickableLeftRelativeToDoc - containerRect.left - scrollLeft;

          Object.assign(
            proxyImage.style,
            {
              display: 'block',
              left: `${unclickableLeftRelativeToContainer}px`,
              top: `${unclickableTopRelativeToContainer}px`,
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

  onProxyImageClick = (event: MouseEvent) => {
    // get target unclickable (unclickable), show overlay
    const targetElement = event.target as HTMLElement;
    const id = targetElement.dataset.blotFormatterId
    this.unclickable = this.unclickableProxies[`${id}`].unclickable
    this.formatter.show(this);
  };

  createProxyContainer(): HTMLElement {
    // create a child div on quill.container to hold all the proxy images
    const proxyContainer = document.createElement('div');
    proxyContainer.classList.add('proxy-container');
    this.formatter.quill.container.appendChild(proxyContainer);
    return proxyContainer;
  }

}
