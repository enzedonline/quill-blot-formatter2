import Quill from 'quill';
const VideoEmbed = Quill.import("formats/video") as any;

class VideoResponsive extends VideoEmbed {
    static create(value: string) {
        const node = super.create(value);
        node.setAttribute('width', '100%');
        node.style.aspectRatio = "16 / 9 auto";
        return node;
    }
}

export default VideoResponsive;
