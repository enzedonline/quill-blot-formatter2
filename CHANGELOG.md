# Changelog

## [v2.0.0] - 2024-06-26
### Changed
Converted all to typescript, drop flow
Custom formats now create span wrapper around image with css applied and
  css directly on iframe (see src\actions\align\AlignFormats.ts)
Formats registered in BlotFormatter.ts
CSS style definitions in src\css\quill-blot-formatter-2.css
Still to-do:
  ImageAlign format class is not satisfactory but it works. Tried to copy 'size' format but ran into 
  `create is not a function` type error. 
