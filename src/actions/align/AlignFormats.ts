import Quill from 'quill';
export const InlineBlot = Quill.import('blots/inline') as any;
const Delta = Quill.import('delta');
const parchment = Quill.import('parchment') as any;
const { ClassAttributor, Scope } = parchment;

const IframeAlign = new ClassAttributor('iframeAlign', 'ql-iframe-align', {
  scope: Scope.BLOCK,
  whitelist: ['left', 'center', 'right'],
});

interface ImageAlignValue {
  align: string;
  title: string;
}

class ImageAlignAttributor extends ClassAttributor {
  constructor() {
    super('imageAlign', 'ql-image-align', {
      scope: Scope.INLINE,
      whitelist: ['left', 'center', 'right'],
    });
  }

  add(node: Element, value: ImageAlignValue): boolean {
    if (typeof value === 'object') {
      super.add(node, value.align);
      if (!!value.title) {
        node.setAttribute('data-title', value.title);
      } else {
        node.removeAttribute('data-title');
      }
      return true;
    } else {
      return super.add(node, value);
    }
  }

  value(node: Element): ImageAlignValue {
    const className = super.value(node);
    const title = node.getAttribute('data-title') || '';
    return {
      align: className,
      title: title,
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
