import Quill from 'quill';
export const InlineBlot = Quill.import('blots/inline') as any;
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
      const width = node.getAttribute('width');
      if (width) {
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
  constructor() {
    super('imageAlign', 'ql-image-align', {
      scope: Scope.INLINE,
      whitelist: ['left', 'center', 'right'],
    });
  }

  add(node: Element, value: ImageAlignInputValue): boolean {
    if (node instanceof HTMLElement && node.firstChild instanceof HTMLElement) {
      if (typeof value === 'object') {
        super.add(node, value.align);
        node.setAttribute('contenteditable', 'false');
        // data-title used to populate caption via ::after
        if (!!value.title) {
          node.setAttribute('data-title', value.title);
        } else {
          node.removeAttribute('data-title');
        }
        node.firstChild.dataset.blotAlign = value.align;
      } else {
        super.add(node, value);
        node.firstChild.dataset.blotAlign = value;
      }
      // set width style property on wrapper if image and has imageAlign format
      // fallback to image natural width if width attribute missing (image not resized))
      // width needed to size wrapper correctly via css
      let width: string | null = node.firstChild.getAttribute('width');
      if (!width) {
        if (node.firstChild instanceof HTMLImageElement) {
          width = `${node.firstChild.naturalWidth}px`;
        } else {
          width = `${node.firstChild.clientWidth}px`
        }
        node.firstChild.setAttribute('width', width);
      }
      node.style.setProperty('--resize-width', width);
      node.setAttribute('data-relative-size', `${width?.endsWith('%')}`)
      return true;
    } else {
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
    const className = super.value(node);
    const title: string = node.getAttribute('data-title') || '';
    let width: string = (node instanceof HTMLElement) ? node.style.getPropertyValue('--resize-width') : '';
    // attempt fallback value for images aligned pre-version 2.2
    if (!parseFloat(width) && node.firstChild instanceof HTMLElement) {
      width = node.firstChild.getAttribute('width') || '';
      if (!parseFloat(width) && node.firstChild instanceof HTMLImageElement) {
        if (node.firstChild.complete) {
          width = `${node.firstChild.naturalWidth}px`;
        } else {
          node.firstChild.onload = () => {
            width = `${(node.firstChild as HTMLImageElement).naturalWidth}px`;
            (node as HTMLElement).style.setProperty('--resize-width', width);
            (node.firstChild as HTMLImageElement).setAttribute('width', width);
          }
        }
      }
    }
    return {
      align: className,
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
