import Quill from 'quill';
const VideoEmbed = Quill.import("formats/video") as any;

/**
 * A custom Quill blot for embedding responsive videos.
 * Extends `VideoEmbed` to ensure videos use a 16:9 aspect ratio and full width.
 *
 * @remarks
 * The aspect ratio is set via the `aspectRatio` static property and applied to the video element's style.
 *
 * @example
 * ```typescript
 * const videoBlot = VideoResponsive.create('https://example.com/video.mp4');
 * ```
 *
 * @extends VideoEmbed
 */
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
