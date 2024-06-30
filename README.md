# Quill Blot Formatter 2 

An update of [quill](https://quilljs.com/) module [quill-blot-formatter](https://github.com/Fandom-OSS/quill-blot-formatter).
to make alignments compatible with Quill V2.
This implementation is exported as a single minified compiled js (/dist/js/quill-blot-formatter-2.min.js). 
Clone and recompile if you need the node modules (see original blot-formatter for config).
Alignment requires relevant css classes defined - see /dist/css/quill-blot-formatter-2.css.

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
`quill-blot-formatter-2.min.js` is provided which exports the same modules as `index.js` under the global `QuillBlotFormatter`.

```html
<script src="<quill>"></script>
<script src="some-path/quill-blot-formatter-2.min.js"></script>
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

## BlotSpec
The `BlotSpec` (/src/specs/BlotSpec.ts) classes define how `BlotFormatter` interacts with blots. They take the `BlotFormatter` as a constructor arg and have the following functions:

### `init(): void`
Called after all specs have been constructed. Use this to bind to quill events to determine when to activate a specific spec.

### ` getActions(): Array<Action>`
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
