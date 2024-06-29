import Quill from 'quill';
export const InlineBlot = Quill.import('blots/inline') as any;

const parchment = Quill.import('parchment') as any;
const { ClassAttributor, Scope } = parchment;

const IframeAlign = new ClassAttributor('iframeAlign', 'ql-iframe-align', {
  scope: Scope.BLOCK,
  whitelist: ['left', 'center', 'right'],
});

const ImageAlign = new ClassAttributor('imageAlign', 'ql-image-align', {
  scope: Scope.INLINE,
  whitelist: ['left', 'center', 'right'],
});

// Register the custom align formats with Quill
Quill.register({
  'formats/imageAlign': ImageAlign,
  'attributors/class/imageAlign': ImageAlign,
  'formats/iframeAlign': IframeAlign,
  'attributors/class/iframeAlign': IframeAlign,
}, true);

export { IframeAlign, ImageAlign }
