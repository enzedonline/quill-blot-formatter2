import Quill from 'quill';
const VideoEmbed = Quill.import("formats/video") as any;

class VideoResponsive extends VideoEmbed {
    static aspectRatio: string = "16 / 9 auto"
    static create(value: string) {
        const node = super.create(value);
        node.setAttribute('width', '100%');
        node.style.aspectRatio = this.aspectRatio;
        return node;
    }
    html () {
        return this.domNode.outerHTML;
    }
}

export default VideoResponsive;
