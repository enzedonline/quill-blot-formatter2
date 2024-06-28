import Quill from 'quill';
import { Aligner } from './Aligner';
import type { Alignment } from './Alignment';
import type { AlignOptions } from '../../Options';
import BlotFormatter from '../../BlotFormatter';
import { ImageAlign, IframeAlignClass } from './AlignFormats';

const LEFT_ALIGN: string = "left"
const CENTER_ALIGN: string = "center"
const RIGHT_ALIGN: string = "right"

export default class DefaultAligner implements Aligner {
  quill: any;
  alignments: { [key: string]: Alignment };
  applyStyle: boolean;

  constructor(options: AlignOptions, formatter: BlotFormatter) {
    this.applyStyle = options.aligner.applyStyle;
    this.quill = formatter.quill;
    this.alignments = {
      [LEFT_ALIGN]: {
        name: LEFT_ALIGN,
        icon: options.icons.left,
        apply: (el: HTMLElement) => {
          this.setAlignment(el, LEFT_ALIGN);
        },
      },
      [CENTER_ALIGN]: {
        name: CENTER_ALIGN,
        icon: options.icons.center,
        apply: (el: HTMLElement) => {
          this.setAlignment(el, CENTER_ALIGN);
        },
      },
      [RIGHT_ALIGN]: {
        name: RIGHT_ALIGN,
        icon: options.icons.right,
        apply: (el: HTMLElement) => {
          this.setAlignment(el, RIGHT_ALIGN);
        },
      },
    };
  }

  getAlignments(): Alignment[] {
    return Object.keys(this.alignments).map(k => this.alignments[k]);
  }

  clear(blot: any) {
    if (blot instanceof HTMLElement) {
      blot = Quill.find(blot)
    }
    if (blot != null) {
      if (blot.domNode.tagName === 'IMG') {
        if (blot.parent !== null && blot.parent.domNode.tagName === 'SPAN') {
          blot.parent.format(ImageAlign.blotName, false)
        }
      } else if (blot.domNode.tagName === 'IFRAME') {
        blot.format(IframeAlignClass.attrName, false)
      }
    }
  }

  isAligned(el: HTMLElement, alignment: Alignment): boolean {
    if (el.tagName === 'IMG') {
      const expectedClass = `${ImageAlign.className}-${alignment.name}`;
      const parentElement = el.parentElement as HTMLElement | null;
      return parentElement !== null && parentElement.tagName === 'SPAN' && parentElement.classList.contains(expectedClass);
    } else if (el.tagName === 'IFRAME') {
      const expectedClass = `${IframeAlignClass.keyName}-${alignment.name}`;
      return el.classList.contains(expectedClass);
    }
    return false;
  }

  setAlignment(el: HTMLElement, alignment: string) {
    let blot = Quill.find(el) as any | null;
    if (blot != null) {
      const hasAlignment = this.isAligned(el, this.alignments[alignment]);
      this.clear(blot);
      if (el.tagName === 'IMG' && !hasAlignment) {
        blot.format(ImageAlign.blotName, this.alignments[alignment].name);
      } else if (el.tagName === 'IFRAME' && !hasAlignment) {
        blot.format(IframeAlignClass.attrName, this.alignments[alignment].name);
      }
    }
  }

}
