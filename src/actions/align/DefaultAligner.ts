import Quill from 'quill';
import { Aligner } from './Aligner';
import type { Alignment } from './Alignment';
import type { Blot } from '../../specs/BlotSpec'
import type { AlignOptions } from '../../Options';
import { ImageAlign, IframeAlign } from './AlignFormats';

const parchment = Quill.import('parchment') as any;
const { Scope } = parchment;

const LEFT_ALIGN: string = "left"
const CENTER_ALIGN: string = "center"
const RIGHT_ALIGN: string = "right"

export default class DefaultAligner implements Aligner {
  alignments: { [key: string]: Alignment };

  constructor(options: AlignOptions) {
    this.alignments = {
      [LEFT_ALIGN]: {
        name: LEFT_ALIGN,
        icon: options.icons.left,
        apply: (blot: Blot | null) => {
          this.setAlignment(blot, LEFT_ALIGN);
        },
      },
      [CENTER_ALIGN]: {
        name: CENTER_ALIGN,
        icon: options.icons.center,
        apply: (blot: Blot | null) => {
          this.setAlignment(blot, CENTER_ALIGN);
        },
      },
      [RIGHT_ALIGN]: {
        name: RIGHT_ALIGN,
        icon: options.icons.right,
        apply: (blot: Blot | null) => {
          this.setAlignment(blot, RIGHT_ALIGN);
        },
      },
    };
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

  isAligned(blot: Blot | null, alignment: Alignment): boolean {
    if (blot != null) {
      if (this.isInlineBlot(blot) || this.hasInlineScope(blot)) {
        // .formats() only returns value on parent for inline class attributers
        const imageAlignment = blot.parent?.formats()[ImageAlign.attrName]?.align;
        return imageAlignment === alignment.name;
      } else if (this.isBlockBlot(blot) || this.hasBlockScope(blot)) {
        // blot.formats() is empty for block class attributers, check classList instead
        return blot.domNode.classList.contains(`${IframeAlign.keyName}-${alignment.name}`);
      }
    }
    return false;
  }

  setAlignment(blot: Blot | null, alignment: string) {
    if (blot != null) {

      const hasAlignment = this.isAligned(blot, this.alignments[alignment]);
      this.clear(blot);
      if (!hasAlignment) {
        if (this.isInlineBlot(blot) || this.hasInlineScope(blot)) {
          blot.format(
            ImageAlign.attrName,
            {
              align: this.alignments[alignment].name,
              title: blot.domNode.getAttribute('title') || ''
            }
          );
        } else if (this.isBlockBlot(blot) || this.hasBlockScope(blot)) {
          console.log(blot)
          blot.format(
            IframeAlign.attrName,
            this.alignments[alignment].name
          );
        }
      }
    }
  }

}
