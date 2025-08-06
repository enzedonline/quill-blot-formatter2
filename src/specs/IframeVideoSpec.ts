import BlotFormatter from '../BlotFormatter';
import UnclickableBlotSpec from './UnclickableBlotSpec';

/**
 * Represents a specification for handling iframe-based video blots within the Quill editor.
 * Extends {@link UnclickableBlotSpec} to provide formatting capabilities for video iframes
 * that should not be clickable.
 *
 * @remarks
 * This class is intended to be used with the BlotFormatter to manage video embeds
 * that use iframes, such as YouTube or Vimeo videos.
 *
 * @param formatter - The {@link BlotFormatter} instance used to apply formatting logic.
 */
export default class IframeVideoSpec extends UnclickableBlotSpec {
  constructor(formatter: BlotFormatter) {
    super(formatter);
  }
}
