# Changelog

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
Updated all dependencies.
