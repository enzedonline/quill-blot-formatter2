# Changelog

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
