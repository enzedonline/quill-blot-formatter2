import Quill from 'quill';
export const InlineBlot = Quill.import('blots/inline') as any;
export type InlineBlotType = typeof InlineBlot;

const parchment = Quill.import('parchment') as any;
const { ClassAttributor, Scope } = parchment;

const IframeAlignClass = new ClassAttributor('iframeAlign', 'ql-iframe-align', {
  scope: Scope.BLOCK,
  whitelist: ['left', 'center', 'right'],
});

// Throws "create is not a function" type error
// const ImageAlign = new ClassAttributor('imageAlign', 'ql-image-align', {
//   scope: Scope.INLINE,
//   whitelist: ['left', 'center', 'right'],
// });

class ImageAlign extends InlineBlot {
  static blotName = 'imageAlign';
  static className = 'ql-image-align';
  static tagName = 'span';

  static create(value: any) {
    const node = super.create();
    if (value) {
      node.classList.remove(`${this.className}`);
      node.classList.add(`${this.className}-${value}`);
    } else {
      const classNames = Array.from(node.classList) as string[];
      classNames.forEach(className => {
        if (className.startsWith(`${this.className}-`)) {
          node.classList.remove(className);
        }
      });
    }
    return node;
  }

  static formats(node: HTMLElement): { [key: string]: any } {
    const format: { [key: string]: any } = {};
    const classNames = node.className.split(' ');
    classNames.forEach(className => {
      if (className.startsWith(`${this.className}-`)) {
        const value = className.substring(this.className.length + 1);
        format[this.blotName] = value;
      }
    });
    return format;
  }

  format(name: string, value: any) {
    if (name === this.blotName) {
      if (value) {
        this.domNode.classList.remove(`${this.className}-${this.formats()[this.blotName]}`);
        this.domNode.classList.add(`${this.className}-${value}`);
      } else {
        const currentFormat = this.formats()[this.blotName];
        if (currentFormat) {
          this.domNode.classList.remove(`${this.className}-${currentFormat}`);
        }
      }
    } else {
      super.format(name, value);
    }
  }
}

export { IframeAlignClass, ImageAlign }
