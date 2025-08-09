
/**
 * Factory function to create a custom Quill Image blot class supporting additional attributes.
 *
 * This function returns a class extending Quill's native Image blot, adding support for the `title` attribute
 * (in addition to `alt`, `height`, and `width`). The returned class overrides the static `formats` method
 * to extract these attributes from the DOM node, and the instance `format` method to set or remove them.
 *
 * @param QuillConstructor - The Quill constructor or instance used to import the base Image blot.
 * @returns A custom Image blot class supporting `alt`, `height`, `width`, and `title` attributes.
 *
 * @remarks
 * - This is useful for enabling the `title` attribute on images in Quill editors, which is not supported by default.
 * - See https://github.com/slab/quill/pull/4350 for related discussion.
 *
 * @example
 * ```typescript
 * const CustomImageBlot = createAltTitleImageBlotClass(Quill);
 * Quill.register(CustomImageBlot);
 * ```
 */
export const createAltTitleImageBlotClass = (QuillConstructor: any): any => {
    const ImageBlot = QuillConstructor.import('formats/image') as any;

    const ATTRIBUTES = ['alt', 'height', 'width', 'title'];

    /**
     * Represents a custom image blot for Quill editor, extending the base `ImageBlot`.
     * 
     * This class provides custom formatting logic to allow managing the `title` attribute missing from the native Quill image blot.
     * See PR https://github.com/slab/quill/pull/4350 for more details.
     * 
     * @remarks
     * - The static `formats` method extracts supported attributes from a DOM node and returns them as a record.
     * - The `format` method sets or removes supported attributes on the image DOM node, delegating to the superclass for unsupported attributes.
     * 
     * @example
     * ```typescript
     * // Extract formats from an image DOM node
     * const formats = Image.formats(domNode);
     * 
     * // Format an image blot
     * imageBlot.format('alt', 'A description');
     * ```
     */
    return class Image extends ImageBlot {
        static blotName = 'image';
        static formats(domNode: Element) {
            return ATTRIBUTES.reduce(
                (formats: Record<string, string | null>, attribute) => {
                    if (domNode.hasAttribute(attribute)) {
                        formats[attribute] = domNode.getAttribute(attribute);
                    }
                    return formats;
                },
                {},
            );
        }

        format(name: string, value: string) {
            if (ATTRIBUTES.indexOf(name) > -1) {
                if (value || name === 'alt') {
                    this.domNode.setAttribute(name, value);
                } else {
                    this.domNode.removeAttribute(name);
                }
            } else {
                super.format(name, value);
            }
        }
    }
}
