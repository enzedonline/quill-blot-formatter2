import Quill from 'quill';
const ImageBlot = Quill.import('formats/image') as any;

const ATTRIBUTES = ['alt', 'height', 'width', 'title'];

class Image extends ImageBlot {
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

export default Image;