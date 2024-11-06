import Quill from 'quill';
export const Inline = Quill.import('blots/inline') as any;
const parchment = Quill.import('parchment') as any;
const { ClassAttributor, Scope } = parchment;

interface IframeAlignValue {
  align: string;
  width: string;
  relativeSize: string;
}

class IframeAlignAttributor extends ClassAttributor {
  constructor() {
    super('iframeAlign', 'ql-iframe-align', {
      scope: Scope.BLOCK,
      whitelist: ['left', 'center', 'right'],
    });
  }

  add(node: Element, value: IframeAlignValue): boolean {
    if (node instanceof HTMLElement) {
      if (typeof value === 'object') {
        super.add(node, value.align);
        node.dataset.blotAlign = value.align;
      } else {
        super.add(node, value);
        node.dataset.blotAlign = value;
      }
      let width: string | null = node.getAttribute('width');
      if (width) {
        // width style value must include units, add 'px' if numeric only
        if (!isNaN(Number(width.trim().slice(-1)))) {
          width = `${width}px`
        }
        node.style.setProperty('--resize-width', width);
        node.dataset.relativeSize = `${width.endsWith('%')}`;
      } else {
        node.style.removeProperty('--resize-width');
        node.dataset.relativeSize = 'false';
      }
      return true;
    } else {
      return false;
    }
  }

  remove(node: Element): void {
    if (node instanceof HTMLElement) {
      super.remove(node);
      delete node.dataset.blotAlign;
    }
  }

  value(node: Element): IframeAlignValue {
    const className = super.value(node);
    const width = (node instanceof HTMLElement) ?
      node.style.getPropertyValue('--resize-width') || node.getAttribute('width') || '' :
      '';
    return {
      align: className,
      width: width,
      relativeSize: `${width.endsWith('%')}`
    };
  }

}

const IframeAlign = new IframeAlignAttributor();

interface ImageAlignInputValue {
  align: string;
  title: string;
}

interface ImageAlignValue extends ImageAlignInputValue {
  width: string;
  contenteditable: string;
  relativeSize: string;
}

class ImageAlignAttributor extends ClassAttributor {
  static tagName = 'SPAN';
  constructor() {
    super('imageAlign', 'ql-image-align', {
      scope: Scope.INLINE,
      whitelist: ['left', 'center', 'right'],
    });
  }

  add(node: Element, value: ImageAlignInputValue | string): boolean {
    if (node instanceof HTMLSpanElement && value) {
      let imageElement = node.querySelector('img') as HTMLImageElement;
      if (typeof value === 'object' && value.align) {
        super.add(node, value.align);
        node.setAttribute('contenteditable', 'false');
        // data-title used to populate caption via ::after
        if (!!value.title) {
          node.setAttribute('data-title', value.title);
        } else {
          node.removeAttribute('data-title');
        }
        if (value.align) {
          imageElement.dataset.blotAlign = value.align;
        }
      } else if (typeof value === 'string') {
        super.add(node, value);
        imageElement.dataset.blotAlign = value;
      } else {
        return false;
      }
      // set width style property on wrapper if image and has imageAlign format
      // fallback to image natural width if width attribute missing (image not resized))
      // width needed to size wrapper correctly via css
      // width style value must include units, add 'px' if numeric only
      let width: string | null = imageElement.getAttribute('width');
      if (!width) {
        width = `${imageElement.naturalWidth}px`;
        imageElement.setAttribute('width', width);
      } else {
        if (!isNaN(Number(width.trim().slice(-1)))) {
          width = `${width}px`
          imageElement.setAttribute('width', width);
        }
      }
      node.style.setProperty('--resize-width', width);
      node.setAttribute('data-relative-size', `${width?.endsWith('%')}`)
      return true;
    } else {
      // bug fix - Quill's inline styles merge elements and remove span element if styles nested
      // for the first outer style, reapply imageAlign format on image 
      // for subsequent outer styles, skip reformat and just return true - will nest multiple span wrappers otherwise
      const imageElement = node.querySelector('img');
      if (imageElement instanceof HTMLImageElement) {
        const imageBlot = Quill.find(imageElement) as any;
        if (imageBlot && node.firstChild instanceof HTMLSpanElement) {
          imageBlot.format('imageAlign', value);
        }
        return true;
      }
      return false;
    }
  }

  remove(node: Element): void {
    if (node instanceof HTMLElement) {
      super.remove(node);
      if (node.firstChild && (node.firstChild instanceof HTMLElement)) {
        delete node.firstChild.dataset.blotAlign;
      }
    }
  }

  value(node: Element): ImageAlignValue {
    // in case nested style, find image element and span wrapper
    const imageElement = node.querySelector('img') as HTMLImageElement;
    const spanWrapper = imageElement.parentElement as HTMLElement;
    const align = super.value(spanWrapper);
    const title: string = imageElement.getAttribute('title') || '';
    let width: string = imageElement.getAttribute('width') || '';
    // attempt fallback value for images aligned pre-version 2.2
    if (!parseFloat(width)) {
      if (imageElement.complete) {
        width = `${imageElement.naturalWidth}px`;
      } else {
        imageElement.onload = () => {
          width = `${imageElement.naturalWidth}px`;
          spanWrapper.style.setProperty('--resize-width', width);
          imageElement.setAttribute('width', width);
        }
      }
    }
    return {
      align: align,
      title: title,
      width: width,
      contenteditable: 'false',
      relativeSize: `${width.endsWith('%')}`
    };
  }
}

const ImageAlign = new ImageAlignAttributor();


// Register the custom align formats with Quill
Quill.register({
  'formats/imageAlign': ImageAlign,
  'attributors/class/imageAlign': ImageAlign,
  'formats/iframeAlign': IframeAlign,
  'attributors/class/iframeAlign': IframeAlign,
}, true);

export { IframeAlign, ImageAlign }
