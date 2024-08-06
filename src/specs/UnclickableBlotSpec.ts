import BlotSpec from './BlotSpec';
import BlotFormatter from '../BlotFormatter';

const MOUSE_ENTER_ATTRIBUTE = 'data-blot-formatter-unclickable-bound';
const PROXY_IMAGE_CLASS = 'blot-formatter__proxy-image';

export default class UnclickableBlotSpec extends BlotSpec {
  selector: string;
  unclickable: HTMLElement | null;
  nextUnclickable: HTMLElement | null;
  proxyImage!: HTMLImageElement;

  constructor(formatter: BlotFormatter, selector: string) {
    super(formatter);
    this.selector = selector;
    this.unclickable = null;
    this.nextUnclickable = null;
  }

  init() {
    if (document.body) {
      /*
      it's important that this is attached to the quill container instead of the root element.
      this prevents the click event from overlapping with ImageSpec
       */
      const proxyImage: HTMLElement | null = this.formatter.quill.container.querySelector('img.blot-formatter__proxy-image')
      if (proxyImage) {
        this.proxyImage = proxyImage as HTMLImageElement
      } else {
        this.formatter.quill.container.appendChild(this.createProxyImage());
      }
    }

    this.hideProxyImage();
    this.proxyImage.addEventListener('click', this.onProxyImageClick);
    this.formatter.quill.on('text-change', this.onTextChange);
    this.formatter.quill.root.addEventListener('scroll', () => {
      // reposition proxy image if quill root scrolls (only if target is child of quill root)
      if (this.nextUnclickable && this.formatter.quill.root.contains(this.nextUnclickable)) {
        this.repositionProxyImage(this.nextUnclickable);
      }
    });
    this.proxyImage.addEventListener('wheel', this.passScrollEventThrough);
  }

  passScrollEventThrough = (event: WheelEvent) => {
    // Manually scroll the quill root element
    this.formatter.quill.root.scrollLeft += event.deltaX;
    this.formatter.quill.root.scrollTop += event.deltaY;
  };

  getTargetElement(): HTMLElement | null {
    return this.unclickable;
  }

  getOverlayElement(): HTMLElement | null {
    return this.unclickable;
  }

  onHide() {
    this.hideProxyImage();
    this.nextUnclickable = null;
    this.unclickable = null;
  }

  createProxyImage(): HTMLElement {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.globalAlpha = 0;
      context.fillRect(0, 0, 1, 1);
    }

    this.proxyImage = document.createElement('img');
    this.proxyImage.src = canvas.toDataURL('image/png');
    this.proxyImage.classList.add(PROXY_IMAGE_CLASS);

    Object.assign(this.proxyImage.style, {
      position: 'absolute',
      margin: '0',
    });

    return this.proxyImage;
  }

  hideProxyImage() {
    Object.assign(this.proxyImage.style, {
      display: 'none',
    });
  }

  repositionProxyImage(unclickable: HTMLElement) {
    const containerRect = this.formatter.quill.container.getBoundingClientRect();
    const iframeRect = unclickable.getBoundingClientRect();
    const iframeTopRelativeToDoc = iframeRect.top + window.scrollY;
    const iframeLeftRelativeToDoc = iframeRect.left + window.scrollX;

    Object.assign(
      this.proxyImage.style,
      {
        display: 'block',
        left: `${iframeLeftRelativeToDoc - containerRect.left}px`,
        top: `${iframeTopRelativeToDoc - containerRect.top}px`,
        width: `${iframeRect.width}px`,
        height: `${iframeRect.height}px`,
      },
    );
  }

  onTextChange = () => {
    Array.from(this.formatter.quill.root.querySelectorAll(this.selector))
      .filter((element): element is HTMLElement => {
        const htmlElement = element as HTMLElement;
        return !(htmlElement.hasAttribute(MOUSE_ENTER_ATTRIBUTE));
      })
      .forEach((unclickable) => {
        unclickable.setAttribute(MOUSE_ENTER_ATTRIBUTE, 'true');
        unclickable.addEventListener('mouseenter', this.onMouseEnter);
      });
  };

  onMouseEnter = (event: MouseEvent) => {
    const unclickable = event.target;
    if (!(unclickable instanceof HTMLElement)) {
      return;
    }

    this.nextUnclickable = unclickable;
    this.repositionProxyImage(this.nextUnclickable);
  }

  onProxyImageClick = () => {
    this.unclickable = this.nextUnclickable;
    this.nextUnclickable = null;
    this.formatter.show(this);
    this.hideProxyImage();
  };
}
