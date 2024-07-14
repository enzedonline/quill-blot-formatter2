# Quill Blot Formatter 2 (quill-blot-formatter2)

An update of [quill](https://quilljs.com/) module [quill-blot-formatter](https://github.com/Fandom-OSS/quill-blot-formatter) to make alignments compatible with Quill V2. Out of the box supports resizing and realigning images and iframe videos, but can be easily extended using [`BlotSpec`](#blotspec) and [`Action`](#action).

## Installation

### Using npm:

```
npm install --save @enzedonline/quill-blot-formatter2
```

## Usage
### As Module
```js
import Quill from 'quill';

Quill.register('modules/blotFormatter2', BlotFormatter2);

const quill = new Quill(..., {
  modules: {
    ...
    blotFormatter2: {
      // see config options below
    }
  }
});
```

### Script Tag
`quill-blot-formatter2.min.js` is provided which exports the same modules as `index.js` under the global `QuillBlotFormatter2`.

```html
<script src="<quill>"></script>
<script src="some-local-path/quill-blot-formatter2.min.js"></script>
<link rel="stylesheet" type="text/css" href="some-local-path/quill-blot-formatter2.css">
<script>
  Quill.register('modules/blotFormatter2', QuillBlotFormatter2.default);
  const quill = new Quill(..., {
      modules: {
          ...
          blotFormatter2: {
            // see config options below
          }
      }
    }
  );
</script>
```
## Alignment and Placing

Alignment and placing is handled by css classes, one set each for image and iframe:
```css
.ql-image-align-left, .ql-image-align-center, .ql-image-align-right,
.ql-iframe-align-left, .ql-iframe-align-center, .ql-iframe-align-right 
```

Suggested css can be found in [src/css/quill-blot-formatter2.css](https://github.com/enzedonline/quill-blot-formatter2/blob/master/src/css/quill-blot-formatter2.css) (shown below). This is also exported to the dist folder. 

**These styles are not loaded automatically**, it is up to you to load the styles relevant to your site.

```css
div.ql-editor .ql-image-align-left,
div.ql-editor .ql-iframe-align-left {
    float: left;
    padding: 0.5em 1em 0.5em 0;
}
div.ql-editor .ql-image-align-center,
div.ql-editor .ql-iframe-align-center  {
    text-align: center;
    margin: 0 auto;
    display: block;
    padding: 0.5em 0;
}
div.ql-editor .ql-image-align-right,
div.ql-editor .ql-iframe-align-right  {
    float: right;
    padding: 0.5em 0 0.5em 1em;
}
```

## BlotSpec
The `BlotSpec` (/src/specs/BlotSpec.ts) classes define how `BlotFormatter` interacts with blots. They take the `BlotFormatter` as a constructor arg and have the following functions:

### `init(): void`
Called after all specs have been constructed. Use this to bind to quill events to determine when to activate a specific spec.

### `getActions(): Array<Action>`
The [`actions`](#action) that are allowed on this blot. The default is `[AlignAction, ResizeAction, DeleteAction]`.

### `getTargetElement(): HTMLElement | null`
When the spec is active this should return the element that is to be formatted

### `getOverlayElement(): HTMLElement | null`
When the spec is active this should return the element to display the formatting overlay. This defaults to `return getTargetElement()` since they will typically be the same element.

### `setSelection(): void`
After the spec is activated this should set the quill selection using [`setSelection`](https://quilljs.com/docs/api/#setselection). Defaults to `quill.setSelection(null)`.

### `onHide(): void`
Called when the spec is deactivated by the user clicking away from the blot. Use this to clean up any state in the spec during activation.

### Notes
Each spec should call `this.formatter.show(this);` to request activation. See `specs/` (/src/specs) for the built-in specs.

## Action
The `Action` (/src/actions/Action.ts) classes define the actions available to a blot once its spec is activated. They take the `BlotFormatter` as a constructor arg and have the following functions:

### `onCreate(): void`
Called immediately after the action is created. Use this to bind quill events and create elements to attach to the overlay.

### `onUpdate(): void`
Called when the formatter has changed something on the blot. Use this to update any internal state.

### `onDestroy(): void`
Called when the formatter is hidden by the user.

See `actions/` (/src/actions) for the existing actions.

## Options
Using quill module options it's easy to disable existing specs, actions, or to override any of the styles provided by this module. For example: if you wanted to remove resizing, support only images, and change the overlay border the following config would work:

```js
import Quill from 'quill';

// from main module
import BlotFormatter2, { AlignAction, DeleteAction, ImageSpec } from 'quill-blot-formatter2'

Quill.register('modules/blotFormatter2', BlotFormatter2);

class CustomImageSpec extends ImageSpec {
    getActions() {
        return [AlignAction, DeleteAction];
    }
}

const quill = new Quill(..., {
  modules: {
    ...
    blotFormatter2: {
      specs: [
        CustomImageSpec,
      ],
      overlay: {
        style: {
          border: '2px solid red',
        }
      }
    }
  }
});
```

### Notes
- For all supported options as well as the default see `Options` (/src/Options.ts).
- object properties are merged, but array properties override the defaults.
- To completely disable styles (`overlay.style`, `resize.handleStyle`, etc) set those to `null`
