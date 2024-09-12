import Quill from 'quill';
import BlotFormatter from '../../BlotFormatter';
import { Aligner } from './Aligner';
import type { Alignment } from './Alignment';
import type { Blot } from '../../specs/BlotSpec'
import type { Options } from '../../Options';
import { ImageAlign, IframeAlign } from './AlignFormats';

const parchment = Quill.import('parchment') as any;
const { Scope } = parchment;

export default class DefaultAligner implements Aligner {
  alignments: Record<string, Alignment> = {};
  options: Options;
  formatter: BlotFormatter

  constructor(formatter: BlotFormatter) {
    this.formatter = formatter;
    this.options = formatter.options;
    this.options.align.alignments.forEach(alignment => {
      this.alignments[alignment] = {
        name: alignment,
        apply: (blot: Blot | null) => {
          this.setAlignment(blot, alignment);
        },
      }
    })
  }

  getAlignments(): Alignment[] {
    return Object.keys(this.alignments).map(k => this.alignments[k]);
  }

  clear(blot: Blot | null): void {
    if (blot != null) {
      if (blot.domNode.tagName === 'IMG') {
        if (blot.parent !== null && blot.parent.domNode.tagName === 'SPAN') {
          blot.parent.format(ImageAlign.attrName, false)
        }
      } else if (blot.domNode.tagName === 'IFRAME') {
        blot.format(IframeAlign.attrName, false)
      }
    }
  }

  isInlineBlot(blot: Blot): boolean {
    return (blot.statics?.scope & Scope.INLINE) === Scope.INLINE_BLOT;
  }

  isBlockBlot(blot: Blot): boolean {
    return (blot.statics?.scope & Scope.BLOCK) === Scope.BLOCK_BLOT;
  }

  hasInlineScope(blot: Blot): boolean {
    return (blot.statics.scope & Scope.INLINE) === Scope.INLINE;
  }

  hasBlockScope(blot: Blot): boolean {
    return (blot.statics.scope & Scope.BLOCK) === Scope.BLOCK;
  }

  isAligned(blot: Blot, alignment: Alignment | null): boolean {
    // true if blot is aligned, if alignment specfied then true only if alignment matches
    const thisAlignment = this.getAlignment(blot);
    if (alignment) {
      return thisAlignment === alignment.name;
    } else {
      return (!!thisAlignment);
    }
  }

  getAlignment(blot: Blot): string | undefined {
    return blot.domNode.dataset.blotAlign;
  }

  setAlignment(blot: Blot | null, alignment: string) {
    if (blot != null) {

      const hasAlignment = this.isAligned(blot, this.alignments[alignment]);
      this.clear(blot);
      if (!hasAlignment) {
        if (this.isInlineBlot(blot) || this.hasInlineScope(blot)) {
          // if no width attr and use relative mandatory, try to set relative width attr
          if (
            !blot.domNode.getAttribute('width') &&
            this.formatter.options.resize.useRelativeSize &&
            !this.formatter.options.resize.allowResizeModeChange
          ) {
            try {
              const editorStyle = getComputedStyle(this.formatter.quill.root);
              const editorWidth = this.formatter.quill.root.clientWidth -
                parseFloat(editorStyle.paddingLeft) -
                parseFloat(editorStyle.paddingRight);
              blot.domNode.setAttribute(
                'width',
                `${Math.min(Math.round(100 * (blot.domNode as HTMLImageElement).naturalWidth / editorWidth), 100)}%`
              )
            } catch { }
          }
          blot.format(
            ImageAlign.attrName,
            {
              align: this.alignments[alignment].name,
              title: blot.domNode.getAttribute('title') || ''
            }
          );
        } else if (this.isBlockBlot(blot) || this.hasBlockScope(blot)) {
          blot.format(
            IframeAlign.attrName,
            this.alignments[alignment].name
          );
        }
      }
    }
  }

}
