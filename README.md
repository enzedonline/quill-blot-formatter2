# Quill Blot Formatter 2 (quill-blot-formatter2)

An update of [quill](https://quilljs.com/) module [quill-blot-formatter](https://github.com/Fandom-OSS/quill-blot-formatter) to make alignments compatible with Quill V2. Out of the box supports resizing and realigning images and iframe videos, but can be easily extended using [`BlotSpec`](#blotspec) and [`Action`](#action).

> [!IMPORTANT]
> Before using this package, it's recommended to at least be familiar with the information covered in [Alt & Title Editing](#alt-text-and-title-editing), [CSS](#css) and [Options](#options)

## New in 2.1 :exclamation:

This release adds alt and title editing support for images. Look for the **`T`** button next to the alignment buttons on the overlay toolbar.

![the new toolbar with alt title editing button](/assets/blot-formatter-image-overlay.png)

Clicking the **`T`** button will open a modal form to add your values.

![the alt/title editing modal form](/assets/blot-formatter-alt-title-editing.png)

Using the suggested css below, the title can also be used a caption on your images.

![a floating image with caption from title attribute](/assets/blot-formatter-floating-image-with-title.png)

See notes below on usage, css and importantly, [supporting image titles in Quill](#alt-text-and-title-editing).

## Installation

### Using npm:

```
npm install --save @enzedonline/quill-blot-formatter2
```

## Compiled JS & CSS

Download both from the [dist folder](https://github.com/enzedonline/quill-blot-formatter2) in this repository, or use jsdelivr CDN's:

```html
<script 
  src="https://cdn.jsdelivr.net/npm/@enzedonline/quill-blot-formatter2@2.1/dist/js/quill-blot-formatter2.min.js">
</script>
<link
  rel="stylesheet" 
  href="https://cdn.jsdelivr.net/npm/@enzedonline/quill-blot-formatter2@2.1/dist/css/quill-blot-formatter2.css"
>
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
<script src="https://cdn.jsdelivr.net/npm/@enzedonline/quill-blot-formatter2@2.1/dist/js/quill-blot-formatter2.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@enzedonline/quill-blot-formatter2@2.1/dist/css/quill-blot-formatter2.css">
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
**[Code Pen](https://codepen.io/enzedonline/pen/bGPgqeG)**

## Alt text and Title Editing

From version 2.1, `alt` and `title` image attributes can be edited from the **`T`** button on the overlay toolbar.

> [!CAUTION]
> #### :exclamation: IMPORTANT NOTE REGARDING QUILL AND IMAGE TITLES :exclamation:
>
>At the time of writing, the current version of Quill (v2.0.2) does not natively support storing the title attribute in the image delta. As such, when you reload the editor, the title attribute will be lost. There is a Quill [pull request](https://github.com/slab/quill/pull/4350) to address this. 
> 
> This package includes an updated Image blot that addresses this issue. 

To use that updated blot, simply include the following in your editor options:

```javascript
blotFormatter2: {
    image: {
        registerImageTitleBlot: true
    }
},
```
***This is not enabled by default as this can potentially overwrite any custom Image blot you might have in use.***

If you use a custom image blot, leave `registerImageTitleBlot` out of your options and be sure to add `title` to supported attributes.

### Modal form labels

For multi-lingual sites, you can change the modal form labels in the options. For example:

```javascript
blotFormatter2: {
    overlay: {
        labels: {
            alt: "Alt tekst",
            title: "Bildetittel",
        },
    },
},
```
### Using the title as caption

For aligned images (assuming your image blot is inline), the image title is copied into the `data-title` attribute of the wrapping `<span>` tag. 

```html
<span class="ql-image-align-center" data-title="some image title">
  <img src="https://example.com/media/images/some-image.png" 
    alt="some alt text" 
    title="some image title">
</span>
```

You can make use of this to display a caption using the [suggested css](#css) below. 

> [!NOTE]
> Using the suggested css, if the title wraps, it will begin to clip the base of the image. This is a limitation of needing to use an absolute position to prevent the caption from growing the span width.

## Alignment and Placing

Alignment and placing is handled by css classes, one set each for image and iframe:
```css
.ql-image-align-left, .ql-image-align-center, .ql-image-align-right,
.ql-iframe-align-left, .ql-iframe-align-center, .ql-iframe-align-right 
```

## CSS

Suggested css can be found in [src/css/quill-blot-formatter2.css](https://github.com/enzedonline/quill-blot-formatter2/blob/master/src/css/quill-blot-formatter2.css) (shown below). This is also exported to the dist folder and published via npm:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@enzedonline/quill-blot-formatter2@2.1/dist/css/quill-blot-formatter2.css">
```

**These styles are not loaded automatically**, it is up to you to load the styles relevant to your site.

```css
/* align left */
div.ql-editor .ql-image-align-left,
div.ql-editor .ql-iframe-align-left {
    float: left;
    margin: 0.5rem 1rem 0.5rem 0;
}
/* align center */
div.ql-editor .ql-image-align-center,
div.ql-editor .ql-iframe-align-center {
    margin: 0.5rem auto;
    display: block;
}
div.ql-editor .ql-image-align-center {
    width: -moz-fit-content;
    width: fit-content;
}
/* align right */
div.ql-editor .ql-image-align-right,
div.ql-editor .ql-iframe-align-right {
    float: right;
    margin: 0.5rem 0 0.5rem 1rem;
}

/* image caption */
div.ql-editor [class^="ql-image-align-"][data-title]:not([data-title=""]) {
    position: relative;
    margin-bottom: 2rem;
}
div.ql-editor [class^="ql-image-align-"][data-title]:not([data-title=""])::after {
    content: attr(data-title);
    display: block;
    position: absolute;
    bottom: -2rem;
    padding-top: 2px;
    margin-bottom: 5px;
    width: -webkit-fill-available;
    font-size: 0.9rem;
    background-color: white;
}
div.ql-editor .ql-image-align-left[data-title]:not([data-title=""])::after {
    text-align: left;
}
div.ql-editor .ql-image-align-center[data-title]:not([data-title=""])::after {
    text-align: center;
}
div.ql-editor .ql-image-align-right[data-title]:not([data-title=""])::after {
    text-align: right;
}
```
## Options

For a default setup using Quill's native Image blot, the recommended options are:

```javascript
blotFormatter2: {
    image: {
        registerImageTitleBlot: true
    }
},
```

> [!IMPORTANT]
> [See above](#alt-text-and-title-editing) for information regarding setting options for alt and title editing.

Using quill module options it's easy to disable existing specs, actions, or to override any of the styles provided by this module. 

For example: if you wanted to remove resizing, support only images, and change the overlay border the following config would work:

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
      image: {
        registerImageTitleBlot: true
      }
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

> [!TIP]
> For all supported options as well as the default see `Options` ([/src/Options.ts](https://github.com/enzedonline/quill-blot-formatter2/blob/master/src/Options.ts)).<br>
> Object properties are merged, but array properties override the defaults.<br>
> To completely disable styles (`overlay.style`, `resize.handleStyle`, etc) set those to `null`
<hr>

## Further Customisations
> [!NOTE]
> The notes from here on are here only for those who wish to customise the default behaviour and/or work with custom blots. <br>
> `blotFormatter2` is already compatible with Quill `Image` and `Video` blots, no custom blots or actions need be registered to work with this package.

### BlotSpec

The `BlotSpec` ([/src/specs/BlotSpec.ts](https://github.com/enzedonline/quill-blot-formatter2/blob/master/src/specs/BlotSpec.ts)) classes define how `BlotFormatter` interacts with blots. They take the `BlotFormatter` as a constructor arg and have the following functions:

#### `init(): void`
Called after all specs have been constructed. Use this to bind to quill events to determine when to activate a specific spec.

#### `getActions(): Array<Action>`
The [`actions`](#action) that are allowed on this blot. The default is `[AlignAction, ResizeAction, DeleteAction]`.

#### `getTargetElement(): HTMLElement | null`
When the spec is active this should return the element that is to be formatted

#### `getOverlayElement(): HTMLElement | null`
When the spec is active this should return the element to display the formatting overlay. This defaults to `return getTargetElement()` since they will typically be the same element.

#### `setSelection(): void`
After the spec is activated this should set the quill selection using [`setSelection`](https://quilljs.com/docs/api/#setselection). Defaults to `quill.setSelection(null)`.

#### `onHide(): void`
Called when the spec is deactivated by the user clicking away from the blot. Use this to clean up any state in the spec during activation.

#### Notes
Each spec should call `this.formatter.show(this);` to request activation. See `specs/` ([/src/specs](https://github.com/enzedonline/quill-blot-formatter2/tree/master/src/specs)) for the built-in specs.

### Action
The `Action` ([/src/actions/Action.ts](https://github.com/enzedonline/quill-blot-formatter2/blob/master/src/actions/Action.ts)) classes define the actions available to a blot once its spec is activated. They take the `BlotFormatter` as a constructor arg and have the following functions:

#### `onCreate(): void`
Called immediately after the action is created. Use this to bind quill events and create elements to attach to the overlay.

#### `onUpdate(): void`
Called when the formatter has changed something on the blot. Use this to update any internal state.

#### `onDestroy(): void`
Called when the formatter is hidden by the user.

See `actions` ([/src/actions](https://github.com/enzedonline/quill-blot-formatter2/tree/master/src/actions)) for the existing actions.


