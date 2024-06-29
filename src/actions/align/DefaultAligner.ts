import { Aligner } from './Aligner';
import type { Alignment } from './Alignment';
import type { Blot } from '../../specs/BlotSpec'
import type { AlignOptions } from '../../Options';
import { ImageAlign, IframeAlign } from './AlignFormats';

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

  clear(blot: Blot | null) {
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

  isAligned(blot: Blot | null, alignment: Alignment): boolean {
    if (blot != null) {
      if (blot.domNode.tagName === 'IMG') {
        return blot.parent != null && blot.parent.formats()[ImageAlign.attrName]===alignment.name;
      } else if (blot.domNode.tagName === 'IFRAME') {
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
      if (blot.domNode.tagName === 'IMG' && !hasAlignment) {
        blot.format(ImageAlign.attrName, this.alignments[alignment].name);
      } else if (blot.domNode.tagName === 'IFRAME' && !hasAlignment) {
        blot.format(IframeAlign.attrName, this.alignments[alignment].name);
      }
    }
  }

}
