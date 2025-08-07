import BlotFormatter from '../../BlotFormatter';
import { Aligner } from './Aligner';
import type { Alignment } from './Alignment';
import type { Blot } from '../../specs/BlotSpec';
import type { Options } from '../../Options';

/**
 * The `DefaultAligner` class provides alignment management for Quill editor blots (such as images and iframes).
 * It implements the `Aligner` interface and is responsible for applying, clearing, and querying alignment
 * formatting on supported blots within the editor.
 *
 * This class supports both inline and block-level blots, and can be configured with custom alignment options.
 * It interacts with Quill's Parchment module to determine blot types and scopes, and uses formatter options
 * to control alignment and resizing behaviors.
 *
 * Key features:
 * - Registers available alignments and exposes them via `getAlignments()`.
 * - Applies alignment to blots using `setAlignment()`, handling both inline (e.g., images) and block (e.g., iframes) elements.
 * - Clears alignment formatting from blots with `clear()`.
 * - Determines blot type and scope with utility methods (`isInlineBlot`, `isBlockBlot`, `hasInlineScope`, `hasBlockScope`).
 * - Checks and retrieves current alignment with `isAligned()` and `getAlignment()`.
 * - Optionally sets relative width for images if configured.
 * - Ensures editor usability by adding a new paragraph if the editor contains only an aligned image.
 *
 * @remarks
 * This class is intended for internal use by the BlotFormatter module and expects a properly configured
 * `BlotFormatter` instance with alignment and resize options.
 *
 * @example
 * ```typescript
 * const aligner = new DefaultAligner(formatter);
 * aligner.setAlignment(blot, 'center');
 * ```
 *
 * @see Aligner
 * @see BlotFormatter
 */
export default class DefaultAligner implements Aligner {
  alignments: Record<string, Alignment> = {};
  options: Options;
  formatter: BlotFormatter;
  private debug: boolean;
  private Scope: any;

  constructor(formatter: BlotFormatter) {
    this.formatter = formatter;    // Get Scope from the formatter's Quill constructor
    this.debug = formatter.options.debug ?? false;
    const parchment = formatter.Quill.import('parchment') as any;
    this.Scope = parchment.Scope;
    this.options = formatter.options;
    this.options.align.alignments.forEach(alignment => {
      this.alignments[alignment] = {
        name: alignment,
        apply: (blot: Blot | null) => {
          this.setAlignment(blot, alignment);
        },
      }
    })
    if (this.debug) {
      console.debug('DefaultAligner created with alignments:', this.alignments);
    }
  }

  /**
   * Retrieves all available alignment options.
   *
   * @returns {Alignment[]} An array of alignment objects defined in the `alignments` property.
   */
  getAlignments = (): Alignment[] => {
    return Object.keys(this.alignments).map(k => this.alignments[k]);
  }

  /**
   * Clears alignment formatting from the given blot if it is an image or iframe.
   *
   * - For image blots (`IMG`), if the parent is a `SPAN`, removes the alignment attribute from the parent.
   * - For iframe blots (`IFRAME`), removes the alignment attribute directly from the blot.
   *
   * @param blot - The blot to clear alignment formatting from, or `null` if none.
   */
  clear = (blot: Blot | null): void => {
    if (blot != null) {
      if (blot.domNode.tagName === 'IMG') {
        if (blot.parent !== null && blot.parent.domNode.tagName === 'SPAN') {
          blot.parent.format(this.formatter.ImageAlign.attrName, false)
          if (this.debug) {
            console.debug('Cleared image alignment from parent span:', blot.parent);
          }
        }
      } else if (blot.domNode.tagName === 'IFRAME') {
        blot.format(this.formatter.IframeAlign.attrName, false)
        if (this.debug) {
          console.debug('Cleared iframe alignment:', blot);
        }
      }
    }
  }

  /**
   * Determines whether the given blot is an inline blot.
   *
   * Checks if the provided `blot` has a scope that matches the inline blot scope.
   *
   * @param blot - The blot instance to check.
   * @returns `true` if the blot is an inline blot; otherwise, `false`.
   */
  isInlineBlot = (blot: Blot): boolean => {
    return (blot.statics?.scope & this.Scope.INLINE) === this.Scope.INLINE_BLOT;
  }

  /**
   * Determines if the provided blot is a block-level blot.
   *
   * Checks the blot's static scope against the BLOCK scope constant,
   * and returns true if it matches the BLOCK_BLOT type.
   *
   * @param blot - The blot instance to check.
   * @returns True if the blot is a block blot; otherwise, false.
   */
  isBlockBlot = (blot: Blot): boolean => {
    return (blot.statics?.scope & this.Scope.BLOCK) === this.Scope.BLOCK_BLOT;
  }

  /**
   * Determines whether the given blot has an inline scope.
   *
   * @param blot - The blot instance to check.
   * @returns `true` if the blot's scope includes the inline scope; otherwise, `false`.
   */
  hasInlineScope = (blot: Blot): boolean => {
    return (blot.statics.scope & this.Scope.INLINE) === this.Scope.INLINE;
  }

  /**
   * Determines whether the given blot has block-level scope.
   *
   * @param blot - The blot instance to check.
   * @returns `true` if the blot's scope includes block-level formatting; otherwise, `false`.
   */
  hasBlockScope = (blot: Blot): boolean => {
    return (blot.statics.scope & this.Scope.BLOCK) === this.Scope.BLOCK;
  }

  /**
   * Determines whether the given blot is aligned.
   *
   * If an alignment is specified, returns `true` only if the blot's alignment matches the specified alignment.
   * If no alignment is specified, returns `true` if the blot has any alignment.
   *
   * @param blot - The blot to check for alignment.
   * @param alignment - The alignment to compare against, or `null` to check for any alignment.
   * @returns `true` if the blot is aligned (and matches the specified alignment, if provided); otherwise, `false`.
   */
  isAligned = (blot: Blot, alignment: Alignment | null): boolean => {
    // true if blot is aligned, if alignment specfied then true only if alignment matches
    const existingAlignment = this.getAlignment(blot);
    if (alignment) {
      return existingAlignment === alignment.name;
    } else {
      return (!!existingAlignment);
    }
  }

  /**
   * Retrieves the alignment value from the given blot's DOM node.
   *
   * @param blot - The blot instance whose alignment is to be determined.
   * @returns The alignment value as a string if present, otherwise `undefined`.
   */
  getAlignment = (blot: Blot): string | undefined => {
    return blot.domNode.dataset.blotAlign;
  }

  /**
   * Sets the alignment for a given blot (content element) in the editor.
   *
   * This method checks if the blot is already aligned as requested. If not, it clears any existing alignment,
   * and applies the new alignment based on the blot type (inline or block). For inline blots (such as images),
   * it may also set a relative width attribute if required by the configuration. For block blots (such as iframes),
   * it applies the alignment directly.
   *
   * Additionally, if the editor contains only an image, it ensures a new paragraph is added underneath to maintain
   * editor usability.
   *
   * @param blot - The blot (content element) to align. Can be `null`, in which case no action is taken.
   * @param alignment - The alignment to apply (e.g., 'left', 'center', 'right'). Must correspond to a key in `this.alignments`.
   */
  setAlignment = (blot: Blot | null, alignment: string): void => {
    if (blot === null) {
      if (this.debug) console.debug('DefaultAligner.setAlignment called with null blot, no action taken');
      return;
    }
    const hasAlignment = this.isAligned(blot, this.alignments[alignment]);
    if (this.debug) console.debug('hasAlignment', hasAlignment);
    this.clear(blot);
    if (!hasAlignment) {
      if (this.isInlineBlot(blot) || this.hasInlineScope(blot)) {
        if (this.debug) console.debug('setting alignment', (this.isInlineBlot(blot) || this.hasInlineScope(blot)));
        // if no width attr and use relative mandatory, try to set relative width attr
        if (
          !blot.domNode.getAttribute('width') &&
          this.options.resize.useRelativeSize &&
          !this.options.resize.allowResizeModeChange
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
          } catch {
            if (this.debug) console.debug('DefaultAligner.setAlignment Error setting image width:', blot);
          }
        }
        if (this.debug) console.debug(
          'DefaultAligner.setAlignment formatting image with',
          this.formatter.ImageAlign.attrName,
          {
            align: this.alignments[alignment].name,
            title: blot.domNode.getAttribute('title') || ''
          }
        )
        blot.format(
          this.formatter.ImageAlign.attrName,
          {
            align: this.alignments[alignment].name,
            title: blot.domNode.getAttribute('title') || ''
          }
        );
        // if image only item in editor, add new paragraph underneath otherwise no selectable item in editor
        try {
          const ops: any = this.formatter.quill.getContents().ops;
          if (ops.length === 2 && ops[1].insert === '\n') {
            this.formatter.quill.insertText(this.formatter.quill.getLength(), '\n', 'user');
          }
        } catch { }
      } else if (this.isBlockBlot(blot) || this.hasBlockScope(blot)) {
        if (this.debug) console.debug(
          'DefaultAligner.setAlignment formatting iframe with',
          this.formatter.IframeAlign.attrName,
          {
            align: this.alignments[alignment].name
          }
        )
        blot.format(
          this.formatter.IframeAlign.attrName,
          this.alignments[alignment].name
        );
      }
    }
  }
}

