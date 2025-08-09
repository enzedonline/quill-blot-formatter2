/**
 * Factory function to create a custom Quill video blot class with responsive styling.
 *
 * @param QuillConstructor - The Quill constructor or instance used to import the base video format.
 * @returns A class extending Quill's VideoEmbed, enforcing a 16:9 aspect ratio and full width for embedded videos.
 *
 * @remarks
 * The returned class, `VideoResponsive`, overrides the default video blot to ensure videos are displayed responsively.
 * The aspect ratio is controlled via the static `aspectRatio` property and applied to the video element's style.
 *
 * @example
 * ```typescript
 * const VideoResponsive = createResponsiveVideoBlotClass(Quill);
 * Quill.register(VideoResponsive);
 * ```
 */
export const createResponsiveVideoBlotClass = (QuillConstructor: any): any => {
    const VideoEmbed = QuillConstructor.import("formats/video") as any;

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
    return class VideoResponsive extends VideoEmbed {
        static blotName = 'video';
        static aspectRatio: string = "16 / 9 auto"
        static create(value: string) {
            const node = super.create(value);
            node.setAttribute('width', '100%');
            node.style.aspectRatio = this.aspectRatio;
            return node;
        }
        html() {
            return this.domNode.outerHTML;
        }
    }
}
