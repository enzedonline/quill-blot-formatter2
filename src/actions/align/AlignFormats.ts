interface IframeAlignValue {
  align: string;
  width: string;
  relativeSize: string;
}

interface ImageAlignInputValue {
  align: string;
  title: string;
}

interface ImageAlignValue extends ImageAlignInputValue {
  width: string;
  contenteditable: string;
  relativeSize: string;
}

/**
 * Represents a class type for Attributors, which are used to define and manage
 * custom attributes in Quill editors. This type describes a constructor signature
 * for Attributor classes, including their prototype and the attribute name they handle.
 *
 * @template T The instance type created by the constructor.
 * @property {string} attrName - The name of the attribute managed by the Attributor.
 */
export type AttributorClass = {
  new (...args: any[]): any;
  prototype: any;
  attrName: string;
}

/**
 * Creates a custom Quill Attributor class for handling iframe alignment.
 *
 * This attributor allows alignment of iframe elements within the Quill editor by
 * applying a CSS class and managing related dataset properties. It also handles
 * width styling and tracks whether the width is relative (percentage-based).
 *
 * @param QuillConstructor - The Quill constructor or Quill instance used to import Parchment.
 * @returns A class extending Quill's ClassAttributor, customized for iframe alignment.
 *
 * @example
 *   this.Quill = this.quill.constructor
 *   const IframeAlignClass = createIframeAlignAttributor(this.Quill);
 *   this.IframeAlign = new IframeAlignClass();
 *   this.Quill.register({
 *     'formats/iframeAlign': this.IframeAlign,
 *     'attributors/class/iframeAlign': this.IframeAlign,
 *   }, true);
 * 
 * @remarks
 * - Supported alignments: 'left', 'center', 'right'.
 * - Adds/removes the `ql-iframe-align` class and manages `data-blot-align` and `--resize-width` style.
 * - Handles both string and object values for alignment.
 */
export const createIframeAlignAttributor = (QuillConstructor: any): AttributorClass => {
  const parchment = QuillConstructor.import('parchment') as any;
  const { ClassAttributor, Scope } = parchment;

  return class IframeAlignAttributor extends ClassAttributor {
    static attrName = 'iframeAlign';

    constructor(private debug = false) {
      super('iframeAlign', 'ql-iframe-align', {
        scope: Scope.BLOCK,
        whitelist: ['left', 'center', 'right'],
      });
    }

    /**
     * Adds alignment and width-related formatting to the specified HTML element node.
     *
     * - Sets the alignment using the provided value, which can be either a string or an object containing an `align` property.
     * - Stores the alignment value in the element's `data-blot-align` attribute.
     * - Handles the element's `width` attribute:
     *   - If present, ensures the width value includes units (appends 'px' if numeric only).
     *   - Sets the CSS custom property `--resize-width` to the processed width value.
     *   - Sets the `data-relative-size` attribute to `'true'` if the width ends with '%', otherwise `'false'`.
     *   - If no width is specified, removes the `--resize-width` property and sets `data-relative-size` to `'false'`.
     *
     * @param node - The DOM element to which alignment and width formatting will be applied.
     * @param value - The alignment value, either as a string or an object with an `align` property.
     * @returns `true` if the formatting was successfully applied to an HTMLElement, otherwise `false`.
     */
    add = (node: Element, value: IframeAlignValue): boolean => {
      if (this.debug) {
        console.debug('IframeAlignAttributor.add', node, value);
      }
      if (node instanceof HTMLElement) {
        if (typeof value === 'object') {
          super.add(node, value.align);
          node.dataset.blotAlign = value.align;
        } else {
          super.add(node, value);
          node.dataset.blotAlign = value;
        }
        let width: string | null = node.getAttribute('width');
        if (width) {
          // width style value must include units, add 'px' if numeric only
          if (!isNaN(Number(width.trim().slice(-1)))) {
            width = `${width}px`
          }
          node.style.setProperty('--resize-width', width);
          node.dataset.relativeSize = `${width.endsWith('%')}`;
        } else {
          node.style.removeProperty('--resize-width');
          node.dataset.relativeSize = 'false';
        }
        if (this.debug) {
          console.debug('IframeAlignAttributor.add - node:', node, 'aligned with:', value);
        }
        return true;
      } else {
        if (this.debug) {
          console.debug('IframeAlignAttributor.add - node is not an HTMLElement, skipping alignment');
        }
        return false;
      }
    }

    /**
     * Removes the alignment formatting from the specified DOM element.
     * 
     * If the provided node is an instance of HTMLElement, this method first calls the
     * parent class's `remove` method to perform any additional removal logic, and then
     * deletes the `data-blot-align` attribute from the element's dataset.
     *
     * @param node - The DOM element from which to remove the alignment formatting.
     */
    remove = (node: Element): void => {
      if (this.debug) {
        console.debug('IframeAlignAttributor.remove', node);
      }
      if (node instanceof HTMLElement) {
        super.remove(node);
        delete node.dataset.blotAlign;
      }
    }

    /**
     * Extracts alignment and width information from a given DOM element.
     *
     * @param node - The DOM element from which to extract alignment and width values.
     * @returns An object containing:
     *   - `align`: The alignment class name derived from the superclass's value method.
     *   - `width`: The width value, determined from the element's CSS custom property '--resize-width', 
     *     its 'width' attribute, or an empty string if not present.
     *   - `relativeSize`: A string indicating whether the width ends with a '%' character, representing a relative size.
     */
    value = (node: Element): IframeAlignValue => {
      const className = super.value(node);
      const width = (node instanceof HTMLElement) ?
        node.style.getPropertyValue('--resize-width') || node.getAttribute('width') || '' :
        '';
      const value = {
        align: className,
        width: width,
        relativeSize: `${width.endsWith('%')}`
      };
      if (this.debug) {
        console.debug('IframeAlignAttributor.value', node, value);
      }
      return value;
    }

  }
}

/**
 * Creates a custom Quill Attributor class for handling image alignment within a span wrapper.
 * 
 * This attributor enables alignment formatting (`left`, `center`, `right`) for images by wrapping them in a `<span>`
 * element with a specific class and managing related attributes such as `data-title` for captions and width handling.
 * It also ensures that the image's alignment and caption are properly reflected in the DOM and Quill's internal model.
 * 
 * @param QuillConstructor - The Quill constructor or instance used to import Parchment and related classes.
 * @returns A custom AttributorClass for image alignment formatting.
 * 
 * @example
 *   this.Quill = this.quill.constructor
 *   const ImageAlignClass = createImageAlignAttributor(this.Quill);
 *   this.ImageAlign = new ImageAlignClass();
 *   this.Quill.register({
 *     'formats/imageAlign': this.ImageAlign,
 *     'attributors/class/imageAlign': this.ImageAlign,
 *   }, true);
 *
 * @remarks
 * - The attributor manages both string and object values for alignment, supporting additional metadata like `title`.
 * - It ensures the wrapper span is not editable and synchronizes width information for correct CSS rendering.
 * - Handles edge cases where Quill merges inline styles, ensuring the image alignment format is reapplied as needed.
 * - The `remove` and `value` methods ensure proper cleanup and retrieval of alignment state.
 */
export const createImageAlignAttributor = (QuillConstructor: any): AttributorClass => {
  const parchment = QuillConstructor.import('parchment') as any;
  const { ClassAttributor, Scope } = parchment;

  return class ImageAlignAttributor extends ClassAttributor {
    static tagName = 'SPAN';
    static attrName = 'imageAlign';

    constructor(private debug = false) {
      super('imageAlign', 'ql-image-align', {
        scope: Scope.INLINE,
        whitelist: ['left', 'center', 'right'],
      });
    }

    /**
     * Adds or updates alignment and related formatting for an image wrapper node.
     *
     * This method applies alignment, caption, and width formatting to a given node containing an image.
     * It handles both object-based and string-based alignment values, updates relevant attributes,
     * and ensures the wrapper is styled correctly for Quill's image formatting.
     *
     * - If the node is an HTMLSpanElement, it sets alignment, caption (data-title), and width attributes.
     * - If the node is not a span, it attempts to find an image child and reapply the imageAlign format.
     * - Handles Quill's inline style merging quirks to avoid redundant wrappers.
     *
     * @param node - The DOM element (typically a span or container) to apply formatting to.
     * @param value - The alignment value, which can be a string or an object containing alignment and optional title.
     * @returns `true` if formatting was applied or handled, `false` otherwise.
     */
    add = (node: Element, value: ImageAlignInputValue | string): boolean => {
      if (this.debug) {
        console.debug('ImageAlignAttributor.add', node, value);
      }
      if (node instanceof HTMLSpanElement && value) {
        let imageElement = node.querySelector('img') as HTMLImageElement;
        if (typeof value === 'object' && value.align) {
          super.add(node, value.align);
          node.setAttribute('contenteditable', 'false');
          // data-title used to populate caption via ::after
          if (!!value.title) {
            node.setAttribute('data-title', value.title);
          } else {
            node.removeAttribute('data-title');
          }
          if (value.align) {
            imageElement.dataset.blotAlign = value.align;
          }
          if (this.debug) {
            console.debug('ImageAlignAttributor.add - imageElement:', imageElement, 'aligned with:', value.align);
          }
        } else if (typeof value === 'string') {
          super.add(node, value);
          imageElement.dataset.blotAlign = value;
          if (this.debug) {
            console.debug('ImageAlignAttributor.add - imageElement:', imageElement, 'aligned with:', value);
          }
        } else {
          if (this.debug) {
            console.debug('ImageAlignAttributor.add - no value provided, skipping alignment');
          }
          return false;
        }
        // set width style property on wrapper if image and has imageAlign format
        // fallback to image natural width if width attribute missing (image not resized))
        // width needed to size wrapper correctly via css
        // width style value must include units, add 'px' if numeric only
        let width: string | null = this.getImageWidth(imageElement);
        node.setAttribute('data-relative-size', `${width?.endsWith('%')}`)
        return true;
      } else {
        // bug fix - Quill's inline styles merge elements and remove span element if styles nested
        // for the first outer style, reapply imageAlign format on image 
        // for subsequent outer styles, skip reformat and just return true - will nest multiple span wrappers otherwise
        const imageElement = node.querySelector('img');
        if (imageElement instanceof HTMLImageElement) {
          // Use QuillConstructor.find to find the image blot, using global Quill static methods will always return null 
          //   in some environments such as vite, react, etc.
          const imageBlot = QuillConstructor.find(imageElement) as any;
          if (this.debug) {
            console.debug('ImageAlignAttributor.add - found image blot:', imageBlot);
          }
          if (
            imageBlot &&
            (
              node.firstChild instanceof HTMLSpanElement ||
              !(imageElement.parentElement?.matches('span[class^="ql-image-align-"]'))
            )
          ) {
            imageBlot.format('imageAlign', value);
            if (this.debug) {
              console.debug('ImageAlignAttributor.add - reapplying imageAlign format to image blot:', value, imageBlot);
            }
          }
          return true;
        }
        return false;
      }
    }

    /**
     * Removes alignment formatting from the given DOM node.
     *
     * If the node is an HTMLElement, it first calls the parent class's remove method.
     * Then, if the node's first child is also an HTMLElement, it deletes the `blotAlign`
     * data attribute from that child element.
     *
     * @param node - The DOM element from which to remove alignment formatting.
     */
    remove = (node: Element): void => {
      if (this.debug) {
        console.debug('ImageAlignAttributor.remove', node);
      }
      if (node instanceof HTMLElement) {
        super.remove(node);
        if (node.firstChild && (node.firstChild instanceof HTMLElement)) {
          delete node.firstChild.dataset.blotAlign;
        }
      }
    }

    /**
     * Retrieves alignment and metadata information for an image element within a given DOM node.
     *
     * This method attempts to find an `<img>` element within the provided node, then extracts its alignment,
     * title, and width attributes. If the width attribute is missing or invalid, it tries to determine the width
     * either immediately (if the image is loaded) or by setting an `onload` handler. The method returns an object
     * containing the alignment, title, width, a `contenteditable` flag, and a boolean string indicating if the width
     * is specified as a percentage.
     *
     * @param node - The DOM element to search for an image and extract alignment and metadata from.
     * @returns An object containing the image's alignment, title, width, contenteditable status, and relative size flag.
     */
    value = (node: Element): ImageAlignValue => {
      // in case nested style, find image element and span wrapper
      const imageElement = node.querySelector('img') as HTMLImageElement;
      if (!imageElement) return null as any; // this can happen during certain 'undo' operations
      const parentElement = imageElement.parentElement as HTMLElement;
      const align = super.value(parentElement);
      const title: string = imageElement.getAttribute('title') || '';
      let width: string = imageElement.getAttribute('width') || '';
      // attempt to get width if missing or image not loaded
      if (!parseFloat(width)) {
        if (imageElement.complete) {
          width = this.getImageWidth(imageElement);
        } else {
          imageElement.onload = (event) => {
            width = this.getImageWidth(event.target as HTMLImageElement);
          }
        }
      }
      const value = {
        align: align,
        title: title,
        width: width,
        contenteditable: 'false',
        relativeSize: `${width.endsWith('%')}`
      };
      if (this.debug) {
        console.debug('ImageAlignAttributor.value', node, value);
      }
      return value;
    }

    /**
     * Retrieves the width of the given HTMLImageElement, ensuring it is set as an attribute and formatted with 'px' units.
     * 
     * - If the 'width' attribute is not present, it uses the image's natural width and sets it as the 'width' attribute in pixels.
     * - If the 'width' attribute exists but does not end with a non-numeric character (i.e., is a number), it appends 'px' to the value.
     * - Updates the parent element's CSS variable '--resize-width' with the computed width.
     * 
     * @param imageElement - The HTMLImageElement whose width is to be retrieved and set.
     * @returns The width of the image as a string with 'px' units.
     */
    getImageWidth = (imageElement: HTMLImageElement) => {
      let width = imageElement.getAttribute('width');
      if (!width) {
        width = `${imageElement.naturalWidth}px`;
        imageElement.setAttribute('width', width);
      } else {
        if (!isNaN(Number(width.trim().slice(-1)))) {
          width = `${width}px`
          imageElement.setAttribute('width', width);
        }
      }
      (imageElement.parentElement as HTMLElement).style.setProperty('--resize-width', width);
      return width;
    }

  }
}
