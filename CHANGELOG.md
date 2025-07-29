# Changelog

## [v2.4.0] - 2025-07-27
### Changed
#### New Actions
- New `link` action allows setting hyperlink on images directly from formatter. Assists adding links to aligned images where selecting in the editor can be problematic. To disable link editing, use option `image.linkOptions.allowLinkEdit` set to `false`.
- New `caret` keyboard action deselects overlay from left/arrow keys and moves caret to previous/next position.

#### Improvements
- Changed the behaviour of deselecting from mouse click so that if clicked directly to the left or right of the overlay, caret will be placed in the previous/next position.
- Toolbar buttons now have tooltips (via `title` attribute). Configurable via options: `toolbar.tooltips`. Each key should match the corresponding action name. See [DefaultOptions](./src/DefaultOptions.ts) for examples.
- Active button styling had previously been hardcoded using the `filter` styling attribute. Now set via options: `toolbar.buttonSelectedStyle` and `toolbar.buttonSelectedClassName`. As with other options, set the styling to null to use only class based styling. This change assists theming.
- Improved default styling for the Alt/Title and Compress modal forms.
- Activating Blot Formatter overlay now closes any open Quill tooltips (such as the link form). 

#### Housekeeping
- Split `DefaultOptions` from `Options` module.

#### Bug fix
- Adjusted flex mode in suggested css to prevent image size collapsing in certain cases on FireFox.

### Updated dependencies
```
├── copy-webpack-plugin@12.0.2
├── deepmerge@4.3.1
├── quill@2.0.3
├── rimraf@6.0.1
├── terser-webpack-plugin@5.3.14
├── ts-loader@9.5.2
├── typescript@5.8.3
├── webpack-cli@6.0.1
└── webpack@5.100.2
```

## [v2.3.0] - 2025-01-14
### Changed
`AttributeAction` will now create an empty `alt` attribute if no value was passed. The optional custom ImageBlot was amended to support this.

Previously, the attribute was removed. This for accessibilty compatibility and allows editors to set a blank `alt` to tell screenreaders to ignore the image.

### Updated
`tsconfig.compilerOptions.module` updated from `commonjs` to `es2022`.

Following package versions updated:

| Package                | Previous Version | Updated Version |
|------------------------|-----------------|-----------------|
| quill                  | ^2.0.2         | ^2.0.3          |
| terser-webpack-plugin  | ^5.3.10        | ^5.3.11         |
| ts-loader              | ^9.5.1         | ^9.5.2          |
| typescript             | ^5.6.2         | ^5.7.3          |
| webpack                | ^5.94.0        | ^5.97.1         |
| webpack-cli            | ^5.1.4         | ^6.0.1          |


## [v2.2.3] - 2024-11-18
### Changed
Bug Fix:
- When image was aligned with other Quill inline styles applied, alignments would get knocked out by other styles when reloading editor from delta or when using `dangerouslyPasteHTML()` (Quill inline styles merge elements). Bug fix reapplies alignment format on image for first wrapped style if encountered to reestablish span wrapper.
- In some cases, if the image was not yet loaded while the format was applied, the width would be set to natural width regardless of pre-existing width attribute. Width is now read on image load in those cases.
- If image width attribute was purely numeric (ie without dimensions), aligning image would cause image to be displayed full width (due to numeric values being invalid for style width attributes). Width now gets 'px' appended if no units in image width attribute.
- Click event on linked image was opening link during editing. Click event no longer propagates.
- Updated CSS to remove text decoration on linked image: caused image caption to be underlined in those cases.
- If image only item in editor, add new paragraph underneath when formatting from toolbar, otherwise unable to place cursor in editor.


## [v2.2.2] - 2024-10-02
### Changed
Enhancements:
- Added Compress action for embedded images (other than gif & svg). Optional action to reduce those images either to a maximum width or to their resized dimensions (if absolute and not relative). Configurable jpeg compression to further reduce image file size.
- Added resize option to protect images from being resized larger than their natural (intrinsic) size. Excludes SVG.

## [v2.2.1] - 2024-09-13
### Changed
Minor bug fix:
- Bug fix: when clicking directly from one video to another, the target became `null` instead of the new target video. Now correctly loads target video.
- Bug fix: insome cases, proxies became misaligned if ancestor element of quill root (other than the document window) was in a scrolled position. Now correctly tracks target video positions regardless of ancestor scroll positions.
- Enhancement: alt/title modal -  Styles & button icons now configurable via options. Replaced button icon unicode glyphs with svg images for more reliable rendering.

## [v2.2.0] - 2024-09-13
### Changed
Major rewrite: 
- New dynamic `Toolbar` module & taken out of `Align` action with simplified add/remove actions via `Options` 
- `UnclickableBlotSpec` rewritten and now creates 1 proxy per unclickable, allows for touch screen compatibility and removes many bugs related to proxy positioning
- `Resize` largely rewritten, including resize by pinch, size info display, relative sizing support for responsive sites
- Enhancement: Support for relative sizes added. Option to enable/disable relative size on blot, option to use relative by default, always or never.
- Enhancement: Added `--resize-width` css element style property and `data-relative` attribute to assist responsive site styling (see readme).
- Enhancement: Support for touch devices including resize by pinch gesture on overlay.
- Enhancement: Size information displayed on touch/mouse down, and when resizing to provide interactive feedback.
- Enhancement: Actions are now optional, turn on/off in the options (see readme).
- Enhancement: Added option to select which alignments are available in the toolbar.
- Enhancement: Context menu on proxy image and overlay disabled - context menu is confusing since it does not relate to the visible element.
- Enhancement: Optional video blot included that creates embed at 100% width & sets aspect-ratio 16:9 and `getSemanticHTML()` fix. Enable as per readme. 
- Enhancement: Height set to `auto` in all cases except where resizing iframe and resize mode is absolute
- Enhancement: Unclickable blot selector can now be configured in options, defaults to `iframe.ql-video`.
- Enhancement: Mouse up/down/move events swapped for pointer events for touch and stylus compatibility.
- Enhancement: Refactored resize action to minimise calculations during drag event. UXP should be smoother and more responsive.
- Enhancement: Added minimum width option to prevent blot from being resized too small and maximum width to limit to editor width.
- Enhancement: Improved suggested CSS no longer clips image when title caption wraps.
- Bug fix: Disable blot formatter if editor is in read only mode (`quill.options.readOnly === true`). 
- Bug fix: Pointer up outside of alt/title edit form dismissed modal, problem arose when select text pointer action extended beyond form bounds. Modal dismisses on pointer down instead of click now.
- Bug fix: Alt/title attributes now removed if empty when submitting alt/title modal.
- Bug fix: Previously could scroll to an uncovered iframe and click before moving pointer. Each iframe now has own proxy, iframes never uncovered.
- Bug fix: Scroll wheel event passed on from proxy image to quill root. Fixes editor not wheel scrolling when pointer is over proxy.
- Bug fix: Scroll wheel event passed on from formatter overlay to quill root. Fixes editor not wheel scrolling when pointer is over formatter overlay.
- Bug fix: Touch scroll on overlay or proxy passes scroll through to quill root. Fixes editor not touch scrolling when touch is on formatter overlay or proxy.
- Bug fix: Reposition proxy images & overlay when quill root scrolls or editor is resized. Previously, proxy image & overlay stayed static on editor scroll, became displaced and caused formatter to activate on iframe when pointer click was elsewhere.
- Bug fix: Reposition proxy images on quill root `text_change` event. Previously, proxy image stayed static if content change before proxy caused iframe position to shift.
- Bug fix: Moved proxy images to `quill.container` to prevent it masking elements outside of editor and also causing window to overflow when editor is scrollable. Assumes `quill.container` has `overflow: hidden;`. See readme notes on scrollable editors.
- Build now generates `.d.ts` definition files.
- Build now uses npm instead of yarn

For customised implementations of this package, be sure to sure to go through the readme for potential breaking changes. If using the new suggested CSS, it may be necessary to reapply alignment formats in some cases. See the CSS section in the readme for more details.

Dependency Updates:
 terser-webpack-plugin   ^5.3.0  →  ^5.3.10
 typescript              ^5.5.4  →   ^5.6.2
 webpack                ^5.93.0  →  ^5.94.0
 node_modules/micromatch fix applied

## [v2.1.2] - 2024-08-05
### Changed
- Remove `width: fit-content;` from `ql-iframe-align-center`, can cause iframe resize issues in certain circumstances and only needed for inline (image) blots.
- Clicking outside of Quill editor now also dismisses overlay (previous behaviour only dismissed if click inside editor).
- Quill `TEXT_CHANGE` event raised on overlay hide - fixes bug when Quill used as form widget, resize cursor remains on image HTML if form submitted without further changes after using BlotFormatter.
- Prevent creating multiple proxy images: if one exists, use that otherwise create a new one.
- Overlay is repositioned if quill root is scrolled or resized. Previously it remained static and did not reposition with the target element.

## [v2.1.1] - 2024-08-01
### Changed
- Fixing typo in documentation only

## [v2.1.0] - 2024-08-01
### Changed
- Changed logic to treat blot according to scope (inline vs. block) rather than tag type to accomodate custom blot types.
- Support for alt and title editing for `<img>` tags via new `AttributeAction`.
- `imageAlign` format takes optional title value - if present, copies image `title` attribute into `data-title` on `<span>` wrapper. Allows for using title for caption via `::after` pseudo element (`::after` not compatible with replacement elements such as `img`).

## [v2.0.0] - 2024-06-29
### Changed
- Converted all to typescript, drop flow
- Custom formats now create span wrapper around image with css applied and css directly on iframe (see src\actions\align\AlignFormats.ts)
- Formats registered in AlignFormats.ts
- CSS style definitions in src\css\quill-blot-formatter2.css
- Updated all dependencies.
