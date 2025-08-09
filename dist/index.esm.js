class v {
  formatter;
  toolbarButtons = [];
  debug;
  constructor(t) {
    this.formatter = t, this.debug = this.formatter.options.debug || !1, this.debug && console.debug("Action created:", this.constructor.name);
  }
  /**
   * Called when the action is created.
   * Override this method to implement custom initialization logic.
   */
  onCreate = () => {
  };
  /**
   * Called when the action is being destroyed.
   * Override this method to implement custom cleanup logic.
   */
  onDestroy = () => {
  };
  /**
   * Called when the action should be updated.
   * Override this method to implement custom update logic.
   */
  onUpdate = () => {
  };
}
class _ extends v {
  /**
   * Moves the caret (text cursor) backward by a specified number of characters within the current selection.
   *
   * If the caret is at the beginning of a text node, it attempts to move to the end of the previous sibling text node.
   * If there is no previous sibling or the selection is not valid, the caret position remains unchanged.
   *
   * @param n - The number of characters to move the caret back. Defaults to 1.
   */
  static sendCaretBack = (t = 1, e = !1) => {
    const i = window.getSelection();
    if (i && i.rangeCount > 0) {
      const s = i.getRangeAt(0), o = s.startContainer, n = s.startOffset;
      if (n > 0)
        s.setStart(o, n - t);
      else if (o.previousSibling) {
        const r = o.previousSibling;
        r.nodeType === Node.TEXT_NODE && s.setStart(r, r.textContent?.length || 0);
      }
      s.collapse(!0), i.removeAllRanges(), i.addRange(s), e && console.debug("Caret moved back by", t, "characters");
    }
  };
  /**
   * Places the caret (text cursor) immediately before the specified blot in the Quill editor.
   *
   * @param quill - The Quill editor instance.
   * @param targetBlot - The blot before which the caret should be placed.
   */
  static placeCaretBeforeBlot = (t, e, i = !1) => {
    const s = t.getIndex(e);
    t.setSelection(s, 0, "user"), i && console.debug("Caret placed before blot at index:", s, e);
  };
  /**
   * Places the caret (text cursor) immediately after the specified blot in the Quill editor.
   *
   * This method first clears any existing selection and ensures the editor is focused.
   * It then calculates the index of the target blot and determines whether it is the last blot in the document.
   * - If the target blot is the last one, the caret is placed at the very end of the document.
   * - Otherwise, the caret is positioned just after the target blot, using a combination of Quill's selection API
   *   and a native browser adjustment to avoid placing the caret inside a formatting span wrapper.
   *
   * @param quill - The Quill editor instance.
   * @param targetBlot - The blot after which the caret should be placed.
   */
  static placeCaretAfterBlot = (t, e, i = !1) => {
    t.setSelection(null), t.root.focus();
    const s = t.getIndex(e), o = t.getLength();
    s + 1 >= o - 1 ? (t.setSelection(o - 1, 0, "user"), i && console.debug("Caret placed at the end of the document after blot:", e)) : (i && console.debug("Caret placed after character following blot at index:", s, e), t.setSelection(s + 2, 0, "user"), this.sendCaretBack(1, i));
  };
  /**
   * Initializes event listeners for the CaretAction.
   *
   * Adds a 'keyup' event listener to the document and an 'input' event listener
   * to the Quill editor's root element. Both listeners trigger the `onKeyUp` handler.
   *
   * @remarks
   * This method should be called when the action is created to ensure proper
   * caret handling and formatting updates in response to user input.
   */
  onCreate = () => {
    document.addEventListener("keyup", this.onKeyUp), this.formatter.quill.root.addEventListener("input", this.onKeyUp);
  };
  /**
   * Cleans up event listeners attached by this action.
   *
   * Removes the 'keyup' event listener from the document and the 'input' event listener
   * from the Quill editor's root element to prevent memory leaks and unintended behavior
   * after the action is destroyed.
   */
  onDestroy = () => {
    document.removeEventListener("keyup", this.onKeyUp), this.formatter.quill.root.removeEventListener("input", this.onKeyUp);
  };
  /**
   * Handles the keyup event for caret navigation around a target blot in the editor.
   *
   * - If a modal is open or there is no current formatting specification, the handler exits early.
   * - If the left arrow key is pressed, places the caret before the target blot and hides the formatter UI.
   * - If the right arrow key is pressed, places the caret after the target blot and hides the formatter UI.
   *
   * @param e - The keyboard event triggered by the user's keyup action.
   */
  onKeyUp = (t) => {
    const e = !!document.querySelector("[data-blot-formatter-modal]");
    if (!this.formatter.currentSpec || e)
      return;
    const i = this.formatter.currentSpec.getTargetBlot();
    i && (t.code === "ArrowLeft" ? (_.placeCaretBeforeBlot(this.formatter.quill, i, this.debug), this.formatter.hide()) : t.code === "ArrowRight" && (_.placeCaretAfterBlot(this.formatter.quill, i, this.debug), this.formatter.hide()));
  };
}
function O(h) {
  return h && h.__esModule && Object.prototype.hasOwnProperty.call(h, "default") ? h.default : h;
}
var C, S;
function H() {
  if (S) return C;
  S = 1;
  var h = function(c) {
    return t(c) && !e(c);
  };
  function t(a) {
    return !!a && typeof a == "object";
  }
  function e(a) {
    var c = Object.prototype.toString.call(a);
    return c === "[object RegExp]" || c === "[object Date]" || o(a);
  }
  var i = typeof Symbol == "function" && Symbol.for, s = i ? Symbol.for("react.element") : 60103;
  function o(a) {
    return a.$$typeof === s;
  }
  function n(a) {
    return Array.isArray(a) ? [] : {};
  }
  function r(a, c) {
    return c.clone !== !1 && c.isMergeableObject(a) ? x(n(a), a, c) : a;
  }
  function l(a, c, d) {
    return a.concat(c).map(function(y) {
      return r(y, d);
    });
  }
  function p(a, c) {
    if (!c.customMerge)
      return x;
    var d = c.customMerge(a);
    return typeof d == "function" ? d : x;
  }
  function m(a) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(a).filter(function(c) {
      return Object.propertyIsEnumerable.call(a, c);
    }) : [];
  }
  function u(a) {
    return Object.keys(a).concat(m(a));
  }
  function g(a, c) {
    try {
      return c in a;
    } catch {
      return !1;
    }
  }
  function b(a, c) {
    return g(a, c) && !(Object.hasOwnProperty.call(a, c) && Object.propertyIsEnumerable.call(a, c));
  }
  function B(a, c, d) {
    var y = {};
    return d.isMergeableObject(a) && u(a).forEach(function(f) {
      y[f] = r(a[f], d);
    }), u(c).forEach(function(f) {
      b(a, f) || (g(a, f) && d.isMergeableObject(c[f]) ? y[f] = p(f, d)(a[f], c[f], d) : y[f] = r(c[f], d));
    }), y;
  }
  function x(a, c, d) {
    d = d || {}, d.arrayMerge = d.arrayMerge || l, d.isMergeableObject = d.isMergeableObject || h, d.cloneUnlessOtherwiseSpecified = r;
    var y = Array.isArray(c), f = Array.isArray(a), R = y === f;
    return R ? y ? d.arrayMerge(a, c, d) : B(a, c, d) : r(c, d);
  }
  x.all = function(c, d) {
    if (!Array.isArray(c))
      throw new Error("first argument should be an array");
    return c.reduce(function(y, f) {
      return x(y, f, d);
    }, {});
  };
  var T = x;
  return C = T, C;
}
var N = H();
const q = /* @__PURE__ */ O(N);
class I {
  formatter;
  element;
  buttons = {};
  constructor(t) {
    this.formatter = t, this.element = document.createElement("div"), this.element.classList.add(this.formatter.options.toolbar.mainClassName), this.element.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    }), this.formatter.options.toolbar.mainStyle && Object.assign(this.element.style, this.formatter.options.toolbar.mainStyle);
  }
  /**
   * Creates and appends toolbar action buttons to the toolbar element. 
   * Called by BlotFormatter.show() to initialize the toolbar.
   * 
   * Iterates through all actions registered in the formatter, collects their toolbar buttons,
   * stores each button in the `buttons` map by its action name, and appends the created button elements
   * to the toolbar's DOM element. Finally, appends the toolbar element to the formatter's overlay.
   */
  create = () => {
    const t = [];
    this.formatter.actions.forEach((e) => {
      e.toolbarButtons.forEach((i) => {
        this.buttons[i.action] = i, t.push(i.create());
      });
    }), this.element.append(...t), this.formatter.overlay.append(this.element), this.formatter.options.debug && console.debug("Toolbar created with buttons:", Object.keys(this.buttons), t);
  };
  /**
   * Cleans up the toolbar by removing its element from the overlay,
   * destroying all associated buttons, and clearing internal references.
   * Called by BlotFormatter.hide() to remove the toolbar from the DOM.
   * 
   * This should be called when the toolbar is no longer needed to prevent memory leaks.
   */
  destroy = () => {
    this.element && this.formatter.overlay.removeChild(this.element);
    for (const t of Object.values(this.buttons))
      t.destroy();
    this.buttons = {}, this.element.innerHTML = "", this.formatter.options.debug && console.debug("Toolbar destroyed");
  };
}
class k {
  /**
   * Initializes the tooltip adjustment watcher when the action is created.
   * Searches for the tooltip element within the Quill container and, if found,
   * sets up observation for tooltip adjustments. Logs a warning if the tooltip
   * element is not present.
   *
   * @remarks
   * This method should be called during the creation lifecycle of the action.
   */
  constructor(t, e = !1) {
    this.quill = t, this.debug = e;
    const i = t.container.querySelector(".ql-tooltip");
    console.debug("tooltip:", i), i ? (k.watchTooltip(t, e), e && console.debug("Tooltip watcher initialized for:", i)) : console.warn("No tooltip found to watch for adjustments.");
  }
  /**
   * Repositions a tooltip element within a given container to ensure it does not overflow
   * the container's boundaries. Adjusts the tooltip's `top` and `left` CSS properties if
   * necessary to keep it fully visible. Optionally logs debug information about the repositioning.
   *
   * @param tooltip - The tooltip HTMLDivElement to reposition.
   * @param container - The container HTMLElement within which the tooltip should remain visible.
   * @param debug - If true, logs debug information to the console. Defaults to false.
   */
  static _repositionTooltip = (t, e, i = !1) => {
    const s = t.getBoundingClientRect(), o = e.getBoundingClientRect();
    let n = s.left - o.left, r = s.top - o.top;
    const l = s.width, p = s.height, m = e.clientWidth, u = e.clientHeight;
    let g = !1;
    const b = {};
    r < 0 && (b.top = `${s.height}px`, g = !0), r + p > u && (b.top = `${u - p}px`, g = !0), n < 0 && (b.left = "0px", g = !0), n + l > m && (b.left = `${m - l}px`, g = !0), g ? (i && console.debug("Repositioning tooltip", b), b.top !== void 0 && (t.style.top = b.top), b.left !== void 0 && (t.style.left = b.left), t.classList.contains("ql-flip") && t.classList.remove("ql-flip")) : i && console.debug("Tooltip position is fine, no changes needed");
  };
  // Static property to store observers
  static observers = /* @__PURE__ */ new WeakMap();
  /**
   * Observes changes to the tooltip's attributes and triggers repositioning when necessary.
   *
   * @param quill - The Quill editor instance containing the tooltip.
   * @param debug - Optional flag to enable debug logging of attribute mutations.
   *
   * @remarks
   * Uses a MutationObserver to monitor changes to the tooltip's `style` and `class` attributes.
   * When a mutation is detected, the tooltip is repositioned within the container.
   * If `debug` is true, mutation details are logged to the console.
   */
  static watchTooltip(t, e = !1) {
    const i = t.container.querySelector(".ql-tooltip"), s = t.container;
    if (!i) {
      console.warn("No tooltip found to watch for adjustments.");
      return;
    }
    this.removeTooltipWatcher(i, e);
    let o = !1;
    const n = new MutationObserver((r) => {
      if (!o) {
        if (e)
          for (const l of r)
            console.debug("Tooltip mutation:", l.attributeName, i.getAttribute(l.attributeName));
        o = !0, this._repositionTooltip(i, s, e), setTimeout(() => {
          o = !1;
        }, 0);
      }
    });
    n.observe(i, {
      attributes: !0,
      attributeFilter: ["style", "class"]
    }), this.observers.set(i, n);
  }
  /**
   * Removes the MutationObserver for the specified tooltip element.
   *
   * @param tooltip - The HTMLDivElement or Quill instance to stop watching.
   *                  If a Quill instance is provided, finds the tooltip within its container.
   */
  static removeTooltipWatcher(t, e = !1) {
    let i = null;
    t instanceof HTMLDivElement ? i = t : i = t.container.querySelector(".ql-tooltip"), i && this.observers.has(i) && (this.observers.get(i)?.disconnect(), this.observers.delete(i), e && console.debug("Tooltip watcher removed for:", i));
  }
  /**
   * Cleans up resources when the action is destroyed.
   * Specifically, it finds the tooltip element within the Quill editor container
   * and removes its associated watcher if the tooltip exists.
   */
  destroy = () => {
    this.quill.container.querySelector(".ql-tooltip") && (k.removeTooltipWatcher(this.quill, this.debug), this.debug && console.debug("Tooltip watcher removed on destroy"));
  };
}
const W = (h) => {
  const t = h.import("formats/image"), e = ["alt", "height", "width", "title"];
  return class extends t {
    static blotName = "image";
    static formats(s) {
      return e.reduce(
        (o, n) => (s.hasAttribute(n) && (o[n] = s.getAttribute(n)), o),
        {}
      );
    }
    format(s, o) {
      e.indexOf(s) > -1 ? o || s === "alt" ? this.domNode.setAttribute(s, o) : this.domNode.removeAttribute(s) : super.format(s, o);
    }
  };
}, D = (h) => {
  const t = h.import("parchment"), { ClassAttributor: e, Scope: i } = t;
  return class extends e {
    constructor(o = !1) {
      super("iframeAlign", "ql-iframe-align", {
        scope: i.BLOCK,
        whitelist: ["left", "center", "right"]
      }), this.debug = o;
    }
    static attrName = "iframeAlign";
    /**
     * Adds alignment and width-related formatting to the specified HTML element node.
     *
     * - Sets the alignment using the provided value, which can be either a string or an object containing an `align` property.
     * - Stores the alignment value in the element's `data-blot-align` attribute.
     * - Handles the element's `width` attribute:
     *   - If present, ensures the width value includes units (appends 'px' if numeric only).
     *   - Sets the CSS custom property `--resize-width` to the processed width value.
     *   - Sets the `data-relative-size` attribute to `'true'` if the width ends with '%', otherwise `'false'`.
     *   - If no width is specified, removes the `--resize-width` property and sets `data-relative-size` to `'false'`.
     *
     * @param node - The DOM element to which alignment and width formatting will be applied.
     * @param value - The alignment value, either as a string or an object with an `align` property.
     * @returns `true` if the formatting was successfully applied to an HTMLElement, otherwise `false`.
     */
    add(o, n) {
      if (this.debug && console.debug("IframeAlignAttributor.add", o, n), o instanceof HTMLElement) {
        typeof n == "object" ? (super.add(o, n.align), o.dataset.blotAlign = n.align) : (super.add(o, n), o.dataset.blotAlign = n);
        let r = o.getAttribute("width");
        return r ? (isNaN(Number(r.trim().slice(-1))) || (r = `${r}px`), o.style.setProperty("--resize-width", r), o.dataset.relativeSize = `${r.endsWith("%")}`) : (o.style.removeProperty("--resize-width"), o.dataset.relativeSize = "false"), this.debug && console.debug("IframeAlignAttributor.add - node:", o, "aligned with:", n), !0;
      } else
        return this.debug && console.debug("IframeAlignAttributor.add - node is not an HTMLElement, skipping alignment"), !1;
    }
    /**
     * Removes the alignment formatting from the specified DOM element.
     * 
     * If the provided node is an instance of HTMLElement, this method first calls the
     * parent class's `remove` method to perform any additional removal logic, and then
     * deletes the `data-blot-align` attribute from the element's dataset.
     *
     * @param node - The DOM element from which to remove the alignment formatting.
     */
    remove(o) {
      this.debug && console.debug("IframeAlignAttributor.remove", o), o instanceof HTMLElement && (super.remove(o), delete o.dataset.blotAlign);
    }
    /**
     * Extracts alignment and width information from a given DOM element.
     *
     * @param node - The DOM element from which to extract alignment and width values.
     * @returns An object containing:
     *   - `align`: The alignment class name derived from the superclass's value method.
     *   - `width`: The width value, determined from the element's CSS custom property '--resize-width', 
     *     its 'width' attribute, or an empty string if not present.
     *   - `relativeSize`: A string indicating whether the width ends with a '%' character, representing a relative size.
     */
    value(o) {
      const n = super.value(o), r = o instanceof HTMLElement && (o.style.getPropertyValue("--resize-width") || o.getAttribute("width")) || "", l = {
        align: n,
        width: r,
        relativeSize: `${r.endsWith("%")}`
      };
      return this.debug && console.debug("IframeAlignAttributor.value", o, l), l;
    }
  };
}, j = (h) => {
  const t = h.import("parchment"), { ClassAttributor: e, Scope: i } = t;
  return class extends e {
    constructor(o = !1) {
      super("imageAlign", "ql-image-align", {
        scope: i.INLINE,
        whitelist: ["left", "center", "right"]
      }), this.debug = o;
    }
    static tagName = "SPAN";
    static attrName = "imageAlign";
    /**
     * Adds or updates alignment and related formatting for an image wrapper node.
     *
     * This method applies alignment, caption, and width formatting to a given node containing an image.
     * It handles both object-based and string-based alignment values, updates relevant attributes,
     * and ensures the wrapper is styled correctly for Quill's image formatting.
     *
     * - If the node is an HTMLSpanElement, it sets alignment, caption (data-title), and width attributes.
     * - If the node is not a span, it attempts to find an image child and reapply the imageAlign format.
     * - Handles Quill's inline style merging quirks to avoid redundant wrappers.
     *
     * @param node - The DOM element (typically a span or container) to apply formatting to.
     * @param value - The alignment value, which can be a string or an object containing alignment and optional title.
     * @returns `true` if formatting was applied or handled, `false` otherwise.
     */
    add(o, n) {
      if (this.debug && console.debug("ImageAlignAttributor.add", o, n), o instanceof HTMLSpanElement && n) {
        let r = o.querySelector("img");
        if (typeof n == "object" && n.align)
          super.add(o, n.align), o.setAttribute("contenteditable", "false"), n.title ? o.setAttribute("data-title", n.title) : o.removeAttribute("data-title"), n.align && (r.dataset.blotAlign = n.align), this.debug && console.debug("ImageAlignAttributor.add - imageElement:", r, "aligned with:", n.align);
        else if (typeof n == "string")
          super.add(o, n), r.dataset.blotAlign = n, this.debug && console.debug("ImageAlignAttributor.add - imageElement:", r, "aligned with:", n);
        else
          return this.debug && console.debug("ImageAlignAttributor.add - no value provided, skipping alignment"), !1;
        let l = this.getImageWidth(r);
        return o.setAttribute("data-relative-size", `${l?.endsWith("%")}`), !0;
      } else {
        const r = o instanceof HTMLImageElement ? o : o.querySelector("img");
        if (this.debug && console.debug(`ImageAlignAttributor.add - ${o.tagName} is not a span, checking for image:`, r), r instanceof HTMLImageElement) {
          const l = h.find(r);
          return this.debug && console.debug("ImageAlignAttributor.add - found image blot:", l), l && (o.firstChild instanceof HTMLSpanElement || !r.parentElement?.matches('span[class^="ql-image-align-"]')) && (l.format("imageAlign", n), this.debug && console.debug("ImageAlignAttributor.add - reapplying imageAlign format to image blot:", n, l)), !0;
        }
        return !1;
      }
    }
    /**
     * Removes alignment formatting from the given DOM node.
     *
     * If the node is an HTMLElement, it first calls the parent class's remove method.
     * Then, if the node's first child is also an HTMLElement, it deletes the `blotAlign`
     * data attribute from that child element.
     *
     * @param node - The DOM element from which to remove alignment formatting.
     */
    remove(o) {
      this.debug && console.debug("ImageAlignAttributor.remove", o), o instanceof HTMLElement && (super.remove(o), o.firstChild && o.firstChild instanceof HTMLElement && delete o.firstChild.dataset.blotAlign);
    }
    /**
     * Retrieves alignment and metadata information for an image element within a given DOM node.
     *
     * This method attempts to find an `<img>` element within the provided node, then extracts its alignment,
     * title, and width attributes. If the width attribute is missing or invalid, it tries to determine the width
     * either immediately (if the image is loaded) or by setting an `onload` handler. The method returns an object
     * containing the alignment, title, width, a `contenteditable` flag, and a boolean string indicating if the width
     * is specified as a percentage.
     *
     * @param node - The DOM element to search for an image and extract alignment and metadata from.
     * @returns An object containing the image's alignment, title, width, contenteditable status, and relative size flag.
     */
    value(o) {
      const n = o.querySelector("img");
      if (!n) return null;
      const r = n.parentElement, l = super.value(r), p = n.getAttribute("title") || "";
      let m = n.getAttribute("width") || "";
      parseFloat(m) || (n.complete ? m = this.getImageWidth(n) : n.onload = (g) => {
        m = this.getImageWidth(g.target);
      });
      const u = {
        align: l,
        title: p,
        width: m,
        contenteditable: "false",
        relativeSize: `${m.endsWith("%")}`
      };
      return this.debug && console.debug("ImageAlignAttributor.value", o, u), u;
    }
    /**
     * Retrieves the width of the given HTMLImageElement, ensuring it is set as an attribute and formatted with 'px' units.
     * 
     * - If the 'width' attribute is not present, it uses the image's natural width and sets it as the 'width' attribute in pixels.
     * - If the 'width' attribute exists but does not end with a non-numeric character (i.e., is a number), it appends 'px' to the value.
     * - Updates the parent element's CSS variable '--resize-width' with the computed width.
     * 
     * @param imageElement - The HTMLImageElement whose width is to be retrieved and set.
     * @returns The width of the image as a string with 'px' units.
     */
    getImageWidth(o) {
      let n = o.getAttribute("width");
      return n ? isNaN(Number(n.trim().slice(-1))) || (n = `${n}px`, o.setAttribute("width", n)) : (n = `${o.naturalWidth}px`, o.setAttribute("width", n)), o.parentElement.style.setProperty("--resize-width", n), n;
    }
  };
}, P = (h) => {
  const t = h.import("formats/video");
  return class extends t {
    static blotName = "video";
    static aspectRatio = "16 / 9 auto";
    static create(i) {
      const s = super.create(i);
      return s.setAttribute("width", "100%"), s.style.aspectRatio = this.aspectRatio, s;
    }
    html() {
      return this.domNode.outerHTML;
    }
  };
};
class $ {
  alignments = {};
  options;
  formatter;
  debug;
  Scope;
  constructor(t) {
    this.formatter = t, this.debug = t.options.debug ?? !1;
    const e = t.Quill.import("parchment");
    this.Scope = e.Scope, this.options = t.options, this.options.align.alignments.forEach((i) => {
      this.alignments[i] = {
        name: i,
        apply: (s) => {
          this.setAlignment(s, i);
        }
      };
    }), this.debug && console.debug("DefaultAligner created with alignments:", this.alignments);
  }
  /**
   * Retrieves all available alignment options.
   *
   * @returns {Alignment[]} An array of alignment objects defined in the `alignments` property.
   */
  getAlignments = () => Object.keys(this.alignments).map((t) => this.alignments[t]);
  /**
   * Clears alignment formatting from the given blot if it is an image or iframe.
   *
   * - For image blots (`IMG`), if the parent is a `SPAN`, removes the alignment attribute from the parent.
   * - For iframe blots (`IFRAME`), removes the alignment attribute directly from the blot.
   *
   * @param blot - The blot to clear alignment formatting from, or `null` if none.
   */
  clear = (t) => {
    t != null && (t.domNode.tagName === "IMG" ? t.parent !== null && t.parent.domNode.tagName === "SPAN" && (t.parent.format(this.formatter.ImageAlign.attrName, !1), this.debug && console.debug("Cleared image alignment from parent span:", t.parent)) : t.domNode.tagName === "IFRAME" && (t.format(this.formatter.IframeAlign.attrName, !1), this.debug && console.debug("Cleared iframe alignment:", t)));
  };
  /**
   * Determines whether the given blot is an inline blot.
   *
   * Checks if the provided `blot` has a scope that matches the inline blot scope.
   *
   * @param blot - The blot instance to check.
   * @returns `true` if the blot is an inline blot; otherwise, `false`.
   */
  isInlineBlot = (t) => (t.statics?.scope & this.Scope.INLINE) === this.Scope.INLINE_BLOT;
  /**
   * Determines if the provided blot is a block-level blot.
   *
   * Checks the blot's static scope against the BLOCK scope constant,
   * and returns true if it matches the BLOCK_BLOT type.
   *
   * @param blot - The blot instance to check.
   * @returns True if the blot is a block blot; otherwise, false.
   */
  isBlockBlot = (t) => (t.statics?.scope & this.Scope.BLOCK) === this.Scope.BLOCK_BLOT;
  /**
   * Determines whether the given blot has an inline scope.
   *
   * @param blot - The blot instance to check.
   * @returns `true` if the blot's scope includes the inline scope; otherwise, `false`.
   */
  hasInlineScope = (t) => (t.statics.scope & this.Scope.INLINE) === this.Scope.INLINE;
  /**
   * Determines whether the given blot has block-level scope.
   *
   * @param blot - The blot instance to check.
   * @returns `true` if the blot's scope includes block-level formatting; otherwise, `false`.
   */
  hasBlockScope = (t) => (t.statics.scope & this.Scope.BLOCK) === this.Scope.BLOCK;
  /**
   * Determines whether the given blot is aligned.
   *
   * If an alignment is specified, returns `true` only if the blot's alignment matches the specified alignment.
   * If no alignment is specified, returns `true` if the blot has any alignment.
   *
   * @param blot - The blot to check for alignment.
   * @param alignment - The alignment to compare against, or `null` to check for any alignment.
   * @returns `true` if the blot is aligned (and matches the specified alignment, if provided); otherwise, `false`.
   */
  isAligned = (t, e) => {
    const i = this.getAlignment(t);
    return e ? i === e.name : !!i;
  };
  /**
   * Retrieves the alignment value from the given blot's DOM node.
   *
   * @param blot - The blot instance whose alignment is to be determined.
   * @returns The alignment value as a string if present, otherwise `undefined`.
   */
  getAlignment = (t) => t.domNode.dataset.blotAlign;
  /**
   * Sets the alignment for a given blot (content element) in the editor.
   *
   * This method checks if the blot is already aligned as requested. If not, it clears any existing alignment,
   * and applies the new alignment based on the blot type (inline or block). For inline blots (such as images),
   * it may also set a relative width attribute if required by the configuration. For block blots (such as iframes),
   * it applies the alignment directly.
   *
   * Additionally, if the editor contains only an image, it ensures a new paragraph is added underneath to maintain
   * editor usability.
   *
   * @param blot - The blot (content element) to align. Can be `null`, in which case no action is taken.
   * @param alignment - The alignment to apply (e.g., 'left', 'center', 'right'). Must correspond to a key in `this.alignments`.
   */
  setAlignment = (t, e) => {
    if (t === null) {
      this.debug && console.debug("DefaultAligner.setAlignment called with null blot, no action taken");
      return;
    }
    const i = this.isAligned(t, this.alignments[e]);
    if (this.debug && console.debug("hasAlignment", i), this.clear(t), !i)
      if (this.isInlineBlot(t) || this.hasInlineScope(t)) {
        if (this.debug && console.debug("setting alignment", this.isInlineBlot(t) || this.hasInlineScope(t)), !t.domNode.getAttribute("width") && this.options.resize.useRelativeSize && !this.options.resize.allowResizeModeChange)
          try {
            const s = getComputedStyle(this.formatter.quill.root), o = this.formatter.quill.root.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
            t.domNode.setAttribute(
              "width",
              `${Math.min(Math.round(100 * t.domNode.naturalWidth / o), 100)}%`
            );
          } catch {
            this.debug && console.debug("DefaultAligner.setAlignment Error setting image width:", t);
          }
        this.debug && console.debug(
          "DefaultAligner.setAlignment formatting image with",
          this.formatter.ImageAlign.attrName,
          {
            align: this.alignments[e].name,
            title: t.domNode.getAttribute("title") || ""
          }
        ), t.format(
          this.formatter.ImageAlign.attrName,
          {
            align: this.alignments[e].name,
            title: t.domNode.getAttribute("title") || ""
          }
        );
        try {
          const s = this.formatter.quill.getContents().ops;
          s.length === 2 && s[1].insert === `
` && this.formatter.quill.insertText(this.formatter.quill.getLength(), `
`, "user");
        } catch {
        }
      } else (this.isBlockBlot(t) || this.hasBlockScope(t)) && (this.debug && console.debug(
        "DefaultAligner.setAlignment formatting iframe with",
        this.formatter.IframeAlign.attrName,
        {
          align: this.alignments[e].name
        }
      ), t.format(
        this.formatter.IframeAlign.attrName,
        this.alignments[e].name
      ));
  };
}
class A {
  action;
  icon;
  onClick;
  options;
  element = null;
  initialVisibility = !0;
  // preset visibility before button is created
  constructor(t, e, i) {
    this.action = t, this.icon = i.icons[t], this.onClick = e, this.options = i;
  }
  /**
   * Creates and initializes the toolbar button element.
   * 
   * This method constructs a `span` element, sets its inner HTML to the provided icon,
   * assigns the appropriate class name and action data attribute, and attaches the click handler.
   * If tooltips are configured for the action, it sets the tooltip text.
   * The button's selected and visible states are initialized, and custom styling is applied.
   * 
   * @returns {HTMLElement} The created and configured toolbar button element.
   */
  create = () => (this.element = document.createElement("span"), this.element.innerHTML = this.icon, this.element.className = this.options.buttonClassName, this.element.dataset.action = this.action, this.element.onclick = this.onClick, this.options.tooltips && this.options.tooltips[this.action] && (this.element.title = this.options.tooltips[this.action]), this.selected = this.preselect(), this.visible = this.initialVisibility, this._styleButton(), this.element);
  /**
   * Cleans up the toolbar button by removing its click event handler,
   * detaching it from the DOM, and clearing the reference to the element.
   * This method should be called when the button is no longer needed to
   * prevent memory leaks.
   */
  destroy = () => {
    this.element && (this.element.onclick = null, this.element.remove(), this.element = null);
  };
  /**
   * Determines whether the toolbar button should appear as selected (active) when loaded.
   * Override this method to provide custom logic for button selection state.
   *
   * @returns {boolean} `true` if the button should be preselected; otherwise, `false`.
   */
  preselect = () => !1;
  /**
   * Indicates whether the toolbar button is currently selected.
   *
   * Returns `true` if the underlying element's `data-selected` attribute is set to `'true'`, otherwise returns `false`.
   */
  get selected() {
    return this.element?.dataset.selected === "true";
  }
  /**
   * Sets the selected state of the toolbar button.
   * 
   * When set to `true`, applies the selected class and style to the button element.
   * When set to `false`, removes the selected class and style, and reapplies the default button style if provided.
   * Also updates the `data-selected` attribute on the element.
   *
   * @param value - Indicates whether the button should be in the selected state.
   */
  set selected(t) {
    this.element && (this.element.dataset.selected = t.toString(), t ? (this.element.classList.add(this.options.buttonSelectedClassName), this.options.buttonSelectedStyle && Object.assign(this.element.style, this.options.buttonSelectedStyle)) : (this.element.classList.remove(this.options.buttonSelectedClassName), this.options.buttonSelectedStyle && (this.element.removeAttribute("style"), this.options.buttonStyle && Object.assign(this.element.style, this.options.buttonStyle))));
  }
  /**
   * Indicates whether the toolbar button is currently visible.
   * Returns `true` if the button's element is not hidden (`display` is not set to `'none'`), otherwise returns `false`.
   */
  get visible() {
    return this.element?.style.display !== "none";
  }
  /**
   * Sets the visibility of the toolbar button element.
   * Accepts a CSS display value as a string or a boolean.
   * If a boolean is provided, `true` sets the display to 'inline-block', and `false` sets it to 'none'.
   * If a string is provided, it is used directly as the CSS display value.
   *
   * @param style - The desired visibility state, either as a CSS display string or a boolean.
   */
  set visible(t) {
    this.element && (typeof t == "boolean" && (t = t ? "inline-block" : "none"), this.element.style.display = t);
  }
  /**
   * Applies custom styles to the toolbar button and its SVG child element, if provided in the options.
   *
   * - If `options.buttonStyle` is defined, it merges the style properties into the button's element.
   * - If `options.svgStyle` is defined, it merges the style properties into the first child element (assumed to be an SVG).
   *
   * @private
   */
  _styleButton = () => {
    if (this.element && (this.options.buttonStyle && Object.assign(this.element.style, this.options.buttonStyle), this.options.svgStyle)) {
      const t = this.element.children[0];
      t && Object.assign(t.style, this.options.svgStyle);
    }
  };
}
class F extends v {
  aligner;
  alignButtons = {};
  constructor(t) {
    super(t), this.aligner = new $(t), t.options.debug && console.debug("AlignAction Aligner created:", this.aligner);
  }
  /**
   * Creates alignment toolbar buttons for each available alignment option.
   * 
   * Iterates over the alignments provided by the aligner and creates a `ToolbarButton`
   * for each alignment, storing them in the `alignButtons` map. If there is a currently
   * selected blot, it checks its alignment and preselects the corresponding button.
   * Optionally logs debug information about the created buttons and the current alignment.
   *
   * @private
   */
  _createAlignmentButtons = () => {
    for (const e of Object.values(this.aligner.alignments))
      this.alignButtons[e.name] = new A(
        e.name,
        this.onClickHandler,
        this.formatter.options.toolbar
      );
    const t = this.formatter.currentSpec?.getTargetBlot();
    if (t) {
      const e = this.aligner.getAlignment(t);
      e && this.alignButtons[e] && (this.alignButtons[e].preselect = () => !0), this.debug && (console.debug("AlignAction alignment buttons created:", this.alignButtons), console.debug("Blot alignment on load:", e));
    }
  };
  /**
   * Clears the selection state of all alignment buttons.
   *
   * Iterates through all buttons in the `alignButtons` collection and sets their
   * `selected` property to `false`. If debugging is enabled, logs a message to the console.
   *
   * @private
   */
  _clearButtons = () => {
    for (const t of Object.values(this.alignButtons))
      t.selected = !1;
    this.debug && console.debug("AlignAction alignment buttons cleared");
  };
  /**
   * Handles click events on alignment toolbar buttons.
   *
   * This event handler determines which alignment action was triggered by the user,
   * retrieves the corresponding alignment configuration, and applies or clears the alignment
   * on the currently selected blot in the editor. It also updates the toolbar button states
   * and logs debug information if enabled.
   *
   * @param event - The click event triggered by the user on a toolbar button.
   */
  onClickHandler = (t) => {
    const e = t.target.closest(`span.${this.formatter.options.toolbar.buttonClassName}`);
    if (e) {
      const i = e.dataset.action || "", s = this.formatter.currentSpec?.getTargetBlot();
      if (i && s) {
        const o = this.aligner.alignments[i];
        this._clearButtons(), this.aligner.isAligned(s, o) ? (this.aligner.clear(s), this.debug && console.debug("AlignAction clear alignment:", i, s)) : (this.aligner.setAlignment(s, i), this.alignButtons[i].selected = !0, this.debug && console.debug("AlignAction set alignment:", i, s));
      }
    }
    this.formatter.update();
  };
  /**
   * Initializes the alignment action by creating alignment buttons and storing them in the toolbar.
   * If debug mode is enabled in the formatter options, logs the created alignment buttons to the console.
   *
   * @returns {void}
   */
  onCreate = () => {
    this._createAlignmentButtons(), this.toolbarButtons = Object.values(this.alignButtons), this.formatter.options.debug && console.debug("AlignAction alignment buttons created:", this.toolbarButtons);
  };
  /**
   * Cleans up resources used by the alignment action.
   * 
   * This method resets the `alignButtons` object and clears the `toolbarButtons` array.
   * If debug mode is enabled in the formatter options, a debug message is logged to the console.
   *
   * @returns {void}
   */
  onDestroy = () => {
    this.alignButtons = {}, this.toolbarButtons = [], this.formatter.options.debug && console.debug("AlignAction alignment buttons destroyed");
  };
}
class U extends v {
  /**
   * Initializes event listeners for the delete action.
   * 
   * - Adds a 'keyup' event listener to the document that triggers `_onKeyUp`.
   * - Adds an 'input' event listener to the Quill editor's root element that also triggers `_onKeyUp`.
   * 
   * This method should be called when the delete action is created to ensure
   * proper handling of keyboard and input events.
   */
  onCreate = () => {
    document.addEventListener("keyup", this._onKeyUp), this.formatter.quill.root.addEventListener("input", this._onKeyUp);
  };
  /**
   * Cleans up event listeners associated with the action.
   * 
   * Removes the 'keyup' event listener from the document and the 'input' event listener
   * from the Quill editor's root element to prevent memory leaks and unintended behavior
   * after the action is destroyed.
   */
  onDestroy = () => {
    document.removeEventListener("keyup", this._onKeyUp), this.formatter.quill.root.removeEventListener("input", this._onKeyUp);
  };
  /**
   * Handles the keyup event for delete and backspace actions.
   * 
   * If no modal is open and a current spec is selected, checks if the pressed key is
   * 'Delete' or 'Backspace'. If so, finds the target blot element in the Quill editor,
   * determines its index, and deletes one character at that index. Afterwards, hides the formatter UI.
   * 
   * @param e - The keyboard event triggered by the user.
   */
  _onKeyUp = (t) => {
    const e = !!document.querySelector("[data-blot-formatter-modal]");
    if (!(!this.formatter.currentSpec || e) && (t.code === "Delete" || t.code === "Backspace")) {
      this.debug && console.debug("DeleteAction keyup detected:", t.code);
      const i = this.formatter.currentSpec.getTargetElement();
      if (i) {
        const s = this.formatter.Quill.find(i);
        if (s) {
          const o = this.formatter.quill.getIndex(s);
          this.formatter.quill.deleteText(o, 1, "user");
        }
      }
      this.formatter.hide();
    }
  };
}
class V extends v {
  _topLeftHandle;
  _topRightHandle;
  _bottomRightHandle;
  _bottomLeftHandle;
  _dragHandle = null;
  _dragStartX = 0;
  _dragCursorStyle;
  _preDragWidth = 0;
  _pinchStartDistance = 0;
  _calculatedAspectRatio = 0;
  _computedAspectRatio = void 0;
  _target;
  _editorStyle;
  _editorWidth = 0;
  _useRelativeSize;
  _resizeModeButton = null;
  _isUnclickable = !1;
  _hasResized = !1;
  _formattedWidth = "";
  _sizeInfoTimerId = null;
  _isImage = !1;
  _isSVG = !1;
  _naturalWidth = void 0;
  constructor(t) {
    super(t), this._topLeftHandle = this._createHandle("top-left", "nwse-resize"), this._topRightHandle = this._createHandle("top-right", "nesw-resize"), this._bottomRightHandle = this._createHandle("bottom-right", "nwse-resize"), this._bottomLeftHandle = this._createHandle("bottom-left", "nesw-resize"), this._dragCursorStyle = document.createElement("style"), this._useRelativeSize = this.formatter.options.resize.useRelativeSize, t.options.resize.allowResizeModeChange && (this._resizeModeButton = this._createResizeModeButton(), this.toolbarButtons = [
      this._resizeModeButton
    ]);
  }
  /**
   * Initializes the resize action by setting up the target element, determining its type,
   * and appending resize handles to the overlay. Also attaches mouse and touch event listeners
   * to the overlay for handling user interactions. Finally, positions the handles according to
   * the specified style options.
   *
   * @remarks
   * This method should be called when the resize action is created to ensure all necessary
   * DOM elements and event listeners are properly initialized.
   */
  onCreate = () => {
    this._target = this.formatter.currentSpec?.getTargetElement(), this._isUnclickable = this.formatter.currentSpec?.isUnclickable || !1, this._isImage = this._target instanceof HTMLImageElement, this._isImage && (this._isSVG = this._isSvgImage()), this.formatter.overlay.append(
      this._topLeftHandle,
      this._topRightHandle,
      this._bottomRightHandle,
      this._bottomLeftHandle
    ), this.formatter.overlay.addEventListener("mousedown", this._onOverlayMouseDown), this.formatter.overlay.addEventListener("mouseup", this._onOverlayMouseUp);
    const t = { passive: !1 };
    this.formatter.overlay.addEventListener("touchstart", this._onOverlayTouchStart, t), this.formatter.overlay.addEventListener("touchmove", this._onOverlayTouchMove, t), this.formatter.overlay.addEventListener("touchend", this._onOverlayTouchEnd, t);
    const e = this.formatter.options.resize.handleStyle || {};
    this._repositionHandles(e), this.debug && console.debug("ResizeAction created with target:", this._target, "isUnclickable:", this._isUnclickable);
  };
  /**
   * Cleans up resources and event listeners associated with the resize action.
   * 
   * This method resets internal state, removes resize handles from the overlay,
   * detaches mouse and touch event listeners, and triggers an update on the formatter.
   * 
   * Should be called when the resize action is no longer needed to prevent memory leaks
   * and unintended behavior.
   */
  onDestroy = () => {
    this._target = null, this._isUnclickable = !1, this._isImage = !1, this._naturalWidth = void 0, this._isSVG = !1, this._setCursor(""), [
      this._topLeftHandle,
      this._topRightHandle,
      this._bottomRightHandle,
      this._bottomLeftHandle
    ].forEach((e) => {
      e.remove();
    }), this.formatter.overlay.removeEventListener("mousedown", this._onOverlayMouseDown), this.formatter.overlay.removeEventListener("mouseup", this._onOverlayMouseUp);
    const t = { passive: !1 };
    this.formatter.overlay.removeEventListener("touchstart", this._onOverlayTouchStart, t), this.formatter.overlay.removeEventListener("touchmove", this._onOverlayTouchMove, t), this.formatter.overlay.removeEventListener("touchend", this._onOverlayTouchEnd, t), this.formatter.update();
  };
  /**
   * Creates a resize handle element for the specified position with the given cursor style.
   *
   * The handle is styled using the class name and optional style provided in the formatter's options.
   * It also sets a `data-position` attribute and attaches a pointer down event listener.
   *
   * @param position - The position identifier for the handle (e.g., 'top-left', 'bottom-right').
   * @param cursor - The CSS cursor style to apply when hovering over the handle.
   * @returns The created HTMLElement representing the resize handle.
   */
  _createHandle = (t, e) => {
    const i = document.createElement("div");
    return i.classList.add(this.formatter.options.resize.handleClassName), i.setAttribute("data-position", t), i.style.cursor = e, this.formatter.options.resize.handleStyle && Object.assign(i.style, this.formatter.options.resize.handleStyle), i.addEventListener("pointerdown", this._onHandlePointerDown), i;
  };
  /**
   * Repositions the resize handles around an element based on the provided handle style.
   *
   * @param handleStyle - Optional style object containing width and height properties for the handles.
   *                      If provided, the handles are offset by half their width and height to center them.
   *                      If not provided, default offsets of '0px' are used.
   *
   * The method updates the `left`, `right`, `top`, and `bottom` CSS properties of the four handles
   * (`_topLeftHandle`, `_topRightHandle`, `_bottomRightHandle`, `_bottomLeftHandle`) to ensure they are
   * correctly positioned relative to the element being resized.
   */
  _repositionHandles = (t) => {
    const e = t?.width ? `${-parseFloat(t.width) / 2}px` : "0px", i = t?.height ? `${-parseFloat(t.height) / 2}px` : "0px", { style: s } = this._topLeftHandle;
    s.left = e, s.top = i;
    const { style: o } = this._topRightHandle;
    o.right = e, o.top = i;
    const { style: n } = this._bottomRightHandle;
    n.right = e, n.bottom = i;
    const { style: r } = this._bottomLeftHandle;
    r.left = e, r.bottom = i;
  };
  /**
   * Sets the cursor style for the document body and all its children.
   * When a non-empty value is provided, it applies the specified cursor style
   * globally by injecting a style element into the document head.
   * When an empty value is provided, it removes the previously injected style element,
   * reverting the cursor to its default behavior.
   *
   * @param value - The CSS cursor value to apply (e.g., 'pointer', 'col-resize').
   */
  _setCursor = (t) => {
    if (!document.body) {
      console.warn("ResizeAction: Cannot set cursor - document.body is null");
      return;
    }
    try {
      t ? (this._dragCursorStyle.innerHTML = `body, body * { cursor: ${t} !important; }`, document.head.contains(this._dragCursorStyle) || document.head.appendChild(this._dragCursorStyle)) : document.head.contains(this._dragCursorStyle) && document.head.removeChild(this._dragCursorStyle);
    } catch (e) {
      console.error("ResizeAction: Error setting cursor style:", e);
    }
  };
  /**
   * Activates or deactivates the resize mode for the target element.
   * 
   * When activated, prepares the target for resizing by determining the resize mode (absolute or relative),
   * calculating editor and target dimensions, handling aspect ratio logic, and displaying size information.
   * When deactivated, applies the finalized width to the _target, updates toolbar button states, sets style attributes,
   * clears cached natural width, updates the formatter, and hides the size info box.
   * 
   * @param activate - If `true`, activates resize mode; if `false`, finalizes and deactivates resize mode.
   */
  _resizeMode = (t) => {
    if (t) {
      if (this._hasResized = !1, this._formattedWidth = "", this._target) {
        this._useRelativeSize = this.formatter._useRelative(this._target), this._editorStyle = getComputedStyle(this.formatter.quill.root), this._editorWidth = this.formatter.quill.root.clientWidth - parseFloat(this._editorStyle.paddingLeft) - parseFloat(this._editorStyle.paddingRight);
        const e = this._target.getBoundingClientRect();
        if ((e.height === void 0 || e.height === 0) && (e.height = this._target.clientHeight + 1), this._preDragWidth = e.width, this._computedAspectRatio = getComputedStyle(this._target).aspectRatio || "auto", this._calculatedAspectRatio = e.width / e.height, this._useRelativeSize)
          this._isUnclickable && this._computedAspectRatio === "auto" && (this._target.style.aspectRatio = this.formatter.options.video.defaultAspectRatio, console.warn(
            `No iframe aspect-ratio set. Set an aspect ratio either via custom blot or css.
Using temporary aspect ratio "${this.formatter.options.video.defaultAspectRatio}"`
          ));
        else if (this._isUnclickable && this._computedAspectRatio !== "auto") {
          const i = this._computedAspectRatio.match(/(\d+)\s*\/\s*(\d+)/);
          if (i)
            try {
              this._calculatedAspectRatio = parseFloat(i[1]) / parseFloat(i[2]);
            } catch {
            }
        }
        this._isImage && !this._useRelativeSize && !this._isSVG && this.formatter.options.resize.imageOversizeProtection && (this._naturalWidth = this._target.naturalWidth), this._showSizeInfo(!0, e.width, e.height), this.debug && console.debug("ResizeAction resize mode activated:", {
          target: this._target,
          useRelativeSize: this._useRelativeSize,
          editorWidth: this._editorWidth,
          preDragWidth: this._preDragWidth,
          aspectRatio: this._calculatedAspectRatio,
          computedAspectRatio: this._computedAspectRatio
        });
      }
    } else {
      if (this._target && this._hasResized) {
        let e = this._roundDimension(this._formattedWidth);
        this._target.setAttribute("width", e), this.formatter.toolbar.buttons.resizeMode && (this.formatter.toolbar.buttons.resizeMode.selected = this.isRelative), this._isUnclickable ? (this._target.style.setProperty("--resize-width", `${e}`), this._target.dataset.relativeSize = `${this.isRelative}`) : this.isAligned && this._target.parentElement && (this._target.parentElement.style.setProperty("--resize-width", `${e}`), this._target.parentElement.dataset.relativeSize = `${this.isRelative}`), this.debug && console.debug("ResizeAction resize mode deactivated:", {
          target: this._target,
          width: e,
          isRelative: this.isRelative,
          isAligned: this.isAligned
        });
      }
      this._naturalWidth = void 0, this.formatter.update(), this._showSizeInfo(!1);
    }
  };
  /**
   * Handles the pointer down event on a resize handle.
   * 
   * Initiates the resize mode, sets up the drag handle, and stores the starting X position.
   * Adds event listeners for pointer move and pointer up to enable drag behavior.
   * 
   * @param event - The pointer event triggered when the user presses down on a resize handle.
   */
  _onHandlePointerDown = (t) => {
    this._resizeMode(!0), t.target instanceof HTMLElement && this._target && (this._dragHandle = t.target, this._setCursor(this._dragHandle.style.cursor), this._dragStartX = t.clientX, document.addEventListener("pointermove", this._onHandleDrag), document.addEventListener("pointerup", this._onHandlePointerUp));
  };
  /**
   * Handles the drag event for a resize handle, updating the target element's width.
   *
   * Calculates the new width based on the pointer's movement and the initial drag position.
   * Ensures the new width stays within the editor's bounds and does not shrink below the minimum allowed width.
   * Applies the new width to both the target element and its overlay.
   *
   * @param event - The pointer event triggered during dragging.
   */
  _onHandleDrag = (t) => {
    if (!this._target || !this._dragHandle) return;
    this._hasResized = !0;
    const e = t.clientX - this._dragStartX, i = this._dragHandle === this._topLeftHandle || this._dragHandle === this._bottomLeftHandle, s = Math.round(
      i ? this._preDragWidth - e : this._preDragWidth + e
    ), o = Math.max(
      Math.min(s, this._editorWidth),
      this.formatter.options.resize.minimumWidthPx
    );
    this._resizeTarget(o);
  };
  /**
   * Handles the pointer up event on the resize handle.
   * 
   * This method disables resize mode, resets the cursor style,
   * and removes the event listeners for pointer movement and pointer up events.
   * It is typically called when the user releases the pointer after resizing.
   */
  _onHandlePointerUp = () => {
    this._setCursor(""), this._resizeMode(!1), document.removeEventListener("pointermove", this._onHandleDrag), document.removeEventListener("pointerup", this._onHandlePointerUp);
  };
  /**
   * Handles the touch start event on the overlay element.
   * If the overlay itself is the _target, enables resize mode.
   * When two fingers touch the target element, prevents default scrolling,
   * calculates the initial distance between the fingers for pinch-to-resize,
   * and stores the initial width of the target element.
   *
   * @param event - The touch event triggered on the overlay.
   */
  _onOverlayTouchStart = (t) => {
    t.target === this.formatter.overlay && (this._resizeMode(!0), this._target && t.touches.length === 2 && (t.preventDefault(), this._pinchStartDistance = this._calculateDistance(t.touches[0], t.touches[1]), this._preDragWidth = this._target.clientWidth));
  };
  /**
   * Handles touch move events on the overlay for resizing the target element via pinch gestures.
   *
   * When two fingers are detected on the overlay, calculates the distance between them to determine
   * the scale factor for resizing. The new width is constrained between a minimum of 10px and the
   * maximum editor width. Prevents default touch behavior such as scrolling during the gesture.
   *
   * @param event - The touch event triggered by user interaction.
   */
  _onOverlayTouchMove = (t) => {
    if (t.target === this.formatter.overlay && this._target && t.touches.length === 2 && this._pinchStartDistance !== null && this._preDragWidth !== null && (t.preventDefault(), this._target)) {
      this._hasResized = !0;
      const i = this._calculateDistance(t.touches[0], t.touches[1]) / this._pinchStartDistance;
      let s = Math.round(this._preDragWidth * i);
      s = Math.max(Math.min(s, this._editorWidth), 10), this._resizeTarget(s);
    }
  };
  /**
   * Handles the touch end event on the overlay element.
   * If the touch event's target is the formatter's overlay, it disables resize mode.
   *
   * @param event - The touch event triggered on the overlay.
   */
  _onOverlayTouchEnd = (t) => {
    t.target === this.formatter.overlay && this._resizeMode(!1);
  };
  /**
   * Handles the mouse down event on the overlay element.
   * If the event target is the formatter's overlay, enables resize mode.
   *
   * @param event - The mouse event triggered by the user interaction.
   */
  _onOverlayMouseDown = (t) => {
    t.target === this.formatter.overlay && this._resizeMode(!0);
  };
  /**
   * Handles the mouse up event on the overlay element.
   * If the event target is the formatter's overlay, it disables resize mode.
   *
   * @param event - The mouse event triggered when the user releases the mouse button.
   */
  _onOverlayMouseUp = (t) => {
    t.target === this.formatter.overlay && this._resizeMode(!1);
  };
  /**
   * Resizes the target element to the specified width, maintaining aspect ratio and updating related UI elements.
   *
   * - Limits the new width if image oversize protection is enabled.
   * - Calculates the new height based on the aspect ratio.
   * - Updates the size information display.
   * - Sets the new width and height attributes on the target element.
   * - Applies the width style property to the wrapper if the image is aligned.
   * - Handles special cases for unclickable elements and absolute sizing.
   * - Triggers an update to the overlay position.
   *
   * @param newWidth - The desired new width for the target element.
   */
  _resizeTarget = (t) => {
    if (!this._target) {
      console.warn("ResizeAction: Cannot resize - target element is null");
      return;
    }
    try {
      t = Math.min(this._naturalWidth ?? 1 / 0, t);
      const e = t / this._calculatedAspectRatio;
      this._updateSizeInfo(t, e), this.formatter._useRelative(this._target) ? this._formattedWidth = `${100 * t / this._editorWidth}%` : this._formattedWidth = `${t}px`, this._target.setAttribute("width", this._formattedWidth), this._target.setAttribute("height", "auto"), this._isUnclickable ? (!this._useRelativeSize && this._computedAspectRatio === "auto" && this._target.setAttribute("height", `${t / this._calculatedAspectRatio | 0}px`), this._target.style.setProperty("--resize-width", this._formattedWidth)) : !this._isUnclickable && this.isAligned && this._target.parentElement && this._target.parentElement.style.setProperty("--resize-width", this._formattedWidth), this.formatter.update();
    } catch (e) {
      console.error("ResizeAction: Error resizing target element:", e);
    }
  };
  /**
   * Shows or hides the size information box for the formatter.
   *
   * When `show` is `true`, cancels any existing size info timer, updates the size info
   * if `width` and `height` are provided, and makes the size info box visible.
   * When `show` is `false`, fades out and closes the size info box.
   *
   * @param show - Whether to show (`true`) or hide (`false`) the size info box.
   * @param width - The width to display in the size info box (optional).
   * @param height - The height to display in the size info box (optional).
   */
  _showSizeInfo = (t, e = null, i = null) => {
    t ? (this._cancelSizeInfoTimer(), e !== null && i !== null && this._updateSizeInfo(e, i), this.formatter.sizeInfo.style.transition = "", this.formatter.sizeInfo.style.opacity = "1") : this._closeSizeInfo();
  };
  /**
   * Updates the size information display for the selected blot.
   *
   * - Rounds the provided width and height to the nearest integer.
   * - Formats the size string as "width x height px".
   * - If the size is relative, displays the percentage relative to the editor width,
   *   with the actual pixel size in brackets.
   * - If the size is absolute and the blot has not been resized:
   *   - If the target element has a `width` attribute that differs from the displayed width,
   *     shows the attribute value and its calculated height, with the displayed size in brackets.
   *   - If the target is an image and its natural dimensions differ from the displayed size,
   *     shows the natural dimensions with the displayed size in brackets.
   * - Updates the `sizeInfo` element in the formatter with the computed size string.
   *
   * @param width - The displayed width of the blot.
   * @param height - The displayed height of the blot.
   */
  _updateSizeInfo = (t, e) => {
    const i = Math.round(t), s = Math.round(e);
    let o = `${i} x ${s}px`;
    if (this.isRelative)
      o = `${Math.round(100 * t / this._editorWidth)}% (${o})`;
    else if (!this._hasResized && this._target) {
      const n = this._target.getAttribute("width");
      if (n) {
        const r = parseFloat(n);
        if (r !== t) {
          const l = t / e, p = Math.round(r / l);
          o = `${n} x ${p}px (${o})`;
        }
      } else if (this._target instanceof HTMLImageElement) {
        const { naturalWidth: r, naturalHeight: l } = this._target;
        r !== t && (o = `${r} x ${l}px (${o})`);
      }
    }
    this.formatter.sizeInfo.innerText = o;
  };
  get isRelative() {
    return this._target?.getAttribute("width")?.endsWith("%") || !1;
  }
  get isAligned() {
    return this._target ? this._target.hasAttribute("data-blot-align") : !1;
  }
  /**
   * Creates a toolbar button for toggling the resize mode.
   *
   * The button is initialized with a unique identifier, a click handler, and toolbar options.
   * The `preselect` property is set to indicate whether the resize mode is currently relative.
   *
   * @returns {ToolbarButton} The configured resize mode toolbar button.
   */
  _createResizeModeButton = () => {
    const t = new A(
      "resizeMode",
      this._onResizeModeClickHandler,
      this.formatter.options.toolbar
    );
    return t.preselect = () => this.isRelative, t;
  };
  /**
   * Handles the click event for the resize mode control.
   * Stops the event from propagating further and swaps the resize mode.
   *
   * @param event - The event object triggered by the click.
   */
  _onResizeModeClickHandler = (t) => {
    t.stopImmediatePropagation(), this._swapResizeMode(!0);
  };
  /**
   * Swaps the resize mode of the target element between relative (percentage-based) and absolute (pixel-based) sizing.
   * Updates the _target's width and height attributes, as well as relevant CSS custom properties and data attributes,
   * depending on the current resize mode and alignment. Also updates the toolbar button state and optionally displays
   * size information.
   *
   * @param showInfo - If true, displays size information after resizing.
   */
  _swapResizeMode = (t = !1) => {
    if (this._target) {
      const e = this._target.getBoundingClientRect();
      this._editorStyle = getComputedStyle(this.formatter.quill.root), this._editorWidth = this.formatter.quill.root.clientWidth - parseFloat(this._editorStyle.paddingLeft) - parseFloat(this._editorStyle.paddingRight);
      let i;
      this.isRelative ? i = `${Math.round(e.width)}px` : i = `${Math.round(100 * e.width / this._editorWidth)}%`, this._target.setAttribute("width", `${i}`), this._target.setAttribute("height", "auto"), this.formatter.currentSpec?.isUnclickable ? (this._target.style.setProperty("--resize-width", `${i}`), this._target.dataset.relativeSize = `${this.isRelative}`) : this.isAligned && this._target.parentElement && (this._target.parentElement.style.setProperty("--resize-width", `${i}`), this._target.parentElement.dataset.relativeSize = `${this.isRelative}`), this.formatter.toolbar.buttons.resizeMode.selected = this.isRelative, this.formatter.update(), t && (this._showSizeInfo(!0, e.width, e.height), this._showSizeInfo(!1)), this.debug && console.debug("ResizeAction resize mode swapped:", {
        target: this._target,
        newWidth: i,
        isRelative: this.isRelative,
        isAligned: this.isAligned
      });
    }
  };
  /**
   * Initiates a timer to fade out the size information element after a delay.
   * Sets the opacity of the `sizeInfo` element to 0 with a transition effect after 1 second.
   * Stores the timer ID in `_sizeInfoTimerId` for potential future reference or cancellation.
   */
  _closeSizeInfo = () => {
    this._sizeInfoTimerId = setTimeout(() => {
      this.formatter.sizeInfo.style.transition = "opacity 1s", this.formatter.sizeInfo.style.opacity = "0";
    }, 1e3);
  };
  /**
   * Cancels the active size info timer, if one exists.
   * Clears the timeout associated with `_sizeInfoTimerId` and resets the timer ID to `null`.
   */
  _cancelSizeInfoTimer = () => {
    this._sizeInfoTimerId !== null && (clearTimeout(this._sizeInfoTimerId), this._sizeInfoTimerId = null);
  };
  /**
   * Calculates the Euclidean distance between two touch points.
   *
   * @param touch1 - The first touch point.
   * @param touch2 - The second touch point.
   * @returns The distance in pixels between the two touch points.
   */
  _calculateDistance = (t, e) => {
    const i = e.clientX - t.clientX, s = e.clientY - t.clientY;
    return Math.sqrt(i * i + s * s);
  };
  /**
   * Rounds the numeric part of a dimension string to the nearest integer, preserving any prefix or suffix.
   *
   * Examples:
   * - '-$34.565c' becomes '-$35c'
   * - '21.244px' becomes '21px'
   *
   * @param dim - The dimension string containing a number and optional prefix/suffix.
   * @returns The dimension string with the numeric part rounded to the nearest integer.
   */
  _roundDimension = (t) => t.replace(/([^0-9.-]*)(-?[\d.]+)(.*)/, (e, i, s, o) => `${i}${Math.round(Number(s))}${o}`);
  /**
   * Determines whether the target image is an SVG image.
   *
   * Checks if the target is an HTMLImageElement and then verifies:
   * - If the image source is a data URL, it checks for the 'image/svg+xml' MIME type.
   * - Otherwise, it checks if the image source URL ends with '.svg'.
   *
   * @returns {boolean} True if the target image is an SVG, otherwise false.
   */
  _isSvgImage = () => this._target instanceof HTMLImageElement ? this._target.src.startsWith("data:image/") ? this._target.src.includes("image/svg+xml") : this._target.src.endsWith(".svg") : !1;
}
class z {
  // abstract class for Blot specifications
  formatter;
  isUnclickable = !1;
  constructor(t) {
    this.formatter = t;
  }
  /**
   * Initializes the blot specification.
   *
   * This method is intended to perform any setup required for the blot spec.
   * It can be overridden by subclasses to provide specific initialization logic.
   * 
   */
  init = () => {
  };
  /**
   * Returns an array of `Action` instances based on the formatter's configuration options.
   * 
   * The returned actions may include:
   * - `AlignAction` if aligning is allowed (`options.align.allowAligning`)
   * - `ResizeAction` if resizing is allowed (`options.resize.allowResizing`)
   * - `DeleteAction` if keyboard deletion is allowed (`options.delete.allowKeyboardDelete`)
   * - Always includes `CaretAction`
   *
   * It can be overridden by subclasses to provide additional actions specific to the blot type.
   * 
   * @returns {Array<Action>} An array of enabled `Action` objects for the current formatter.
   */
  getActions() {
    const t = [];
    return this.formatter.options.align.allowAligning && t.push(new F(this.formatter)), this.formatter.options.resize.allowResizing && t.push(new V(this.formatter)), this.formatter.options.delete.allowKeyboardDelete && t.push(new U(this.formatter)), t.push(new _(this.formatter)), t;
  }
  /**
   * Returns the target HTML element associated with this blot.
   * 
   * This method is intended to be overridden by subclasses to provide the specific target element
   * for the blot type.
   *
   * @returns {HTMLElement | null} The target element, or `null` if none exists.
   */
  getTargetElement = () => null;
  /**
   * Retrieves the target blot associated with the current selection.
   *
   * This method first obtains the target DOM element using `getTargetElement()`.
   * If a target element exists, it uses the Quill instance to find and return the corresponding blot.
   * If no target element is found, it returns `null`.
   * 
   * @remarks
   * This method uses the quill instance constructor to overcome issue encountered with `Quill.find()`
   * with certain environments where the `Quill` global differs from the one used in the quill instance.
   * In those cases, the `find()` method will always return `null`. These environments include: vite,
   * react and angular.
   *
   * @returns {Blot | null} The blot corresponding to the target element, or `null` if not found.
   */
  getTargetBlot = () => {
    const t = this.getTargetElement();
    return t ? this.formatter.Quill.find(t) : null;
  };
  /**
   * Returns the overlay element associated with the blot.
   * 
   * @returns {HTMLElement | null} The overlay element, or `null` if none exists.
   */
  getOverlayElement = () => this.getTargetElement();
  /**
   * Clears the current selection in the Quill editor by setting it to `null`.
   * This effectively removes any active text selection.
   *
   * @remarks
   * Useful for resetting the editor's selection state, such as after formatting actions.
   */
  setSelection = () => {
    this.formatter.quill.setSelection(null);
  };
  /**
   * Callback invoked when the blot is hidden.
   * Override this method to implement custom hide behavior.
   */
  onHide = () => {
  };
}
const X = "blot-formatter__proxy-image";
class Y extends z {
  selector;
  unclickable;
  proxyContainer;
  unclickableProxies;
  isUnclickable = !0;
  constructor(t) {
    super(t), this.selector = t.options.video.selector, this.unclickable = null, this.proxyContainer = this._createProxyContainer(), this.unclickableProxies = {};
  }
  /**
   * Initializes event listeners and observers for unclickable blot proxies.
   * - Sets up a listener for Quill's 'text-change' event to handle updates.
   * - Adds a scroll event listener to the Quill root to reposition proxy images when scrolling occurs.
   * - Observes editor resize events to maintain correct proxy positioning.
   */
  init = () => {
    this.formatter.quill.on("text-change", this._onTextChange), this.formatter.quill.root.addEventListener("scroll", () => {
      this._repositionProxyImages();
    }), this._observeEditorResize();
  };
  /**
   * Observes the Quill editor's root element for resize events and triggers repositioning
   * of proxy images when the editor's dimensions change (e.g., due to screen resize or editor grow/shrink).
   * Uses a debounced approach to avoid excessive repositioning by waiting 200ms after the last resize event.
   *
   * @remarks
   * This method sets up a `ResizeObserver` on the editor's root element and calls
   * `_repositionProxyImages` whenever a resize is detected, with debouncing to improve performance.
   */
  _observeEditorResize = () => {
    let t = null;
    new ResizeObserver((i) => {
      for (const s of i)
        t && clearTimeout(t), t = window.setTimeout(() => {
          this._repositionProxyImages();
        }, 200);
    }).observe(this.formatter.quill.root);
  };
  /**
   * Returns the target HTML element associated with this instance.
   * 
   * @returns {HTMLElement | null} The unclickable HTML element, or `null` if not set.
   */
  getTargetElement = () => this.unclickable;
  /**
   * Returns the overlay HTML element associated with the blot, or `null` if none exists.
   *
   * @returns {HTMLElement | null} The unclickable overlay element, or `null` if not set.
   */
  getOverlayElement = () => this.unclickable;
  /**
   * Handles changes to the text content within the Quill editor.
   *
   * This method performs the following actions:
   * 1. Checks if any "unclickable" elements tracked by proxies have been deleted from the editor.
   *    If so, it removes their corresponding proxy images and cleans up the tracking object.
   * 2. Searches for new "unclickable" elements that do not yet have a proxy image and creates proxies for them.
   * 3. Repositions all proxy images to ensure they are correctly aligned with their associated elements.
   *
   * This method is intended to be called whenever the editor's content changes to keep proxy images in sync.
   */
  _onTextChange = () => {
    Object.entries(this.unclickableProxies).forEach(([t, { unclickable: e, proxyImage: i }]) => {
      try {
        this.formatter.quill.root.contains(e) || (i.remove(), delete this.unclickableProxies[t]);
      } catch {
      }
    }), this.formatter.quill.root.querySelectorAll(`${this.selector}:not([data-blot-formatter-id])`).forEach((t) => {
      this._createUnclickableProxyImage(t);
    }), this._repositionProxyImages();
  };
  /**
   * Creates a transparent proxy image overlay for an unclickable HTML element.
   * The proxy image is linked to the unclickable element via a randomly generated ID,
   * which is stored in the element's dataset and used as a key in the `unclickableProxies` record.
   * The proxy image is styled to be absolutely positioned and unselectable, and is appended to the proxy container.
   * Event listeners are attached to the proxy image to handle click, context menu, wheel, and touch events,
   * allowing interaction to be managed or passed through as needed.
   *
   * @param unclickable - The target HTMLElement to overlay with a transparent proxy image.
   */
  _createUnclickableProxyImage = (t) => {
    const e = Array.from(
      crypto.getRandomValues(new Uint8Array(5)),
      (r) => String.fromCharCode(97 + r % 26)
    ).join("");
    t.dataset.blotFormatterId = e;
    const i = document.createElement("canvas"), s = i.getContext("2d");
    s && (s.globalAlpha = 0, s.fillRect(0, 0, 1, 1));
    const o = document.createElement("img");
    o.src = i.toDataURL("image/png"), o.classList.add(X), o.dataset.blotFormatterId = e;
    const n = {
      ...this.formatter.options.video.proxyStyle,
      position: "absolute",
      margin: "0",
      userSelect: "none"
    };
    Object.assign(o.style, n), o.style.setProperty("-webkit-user-select", "none"), o.style.setProperty("-moz-user-select", "none"), o.style.setProperty("-ms-user-select", "none"), this.formatter.options.debug && o.style.setProperty("border", "3px solid red"), this.proxyContainer.appendChild(o), o.addEventListener("click", this._onProxyImageClick), o.addEventListener("contextmenu", (r) => {
      r.stopPropagation(), r.preventDefault();
    }), o.addEventListener("wheel", this.formatter._passWheelEventThrough), o.addEventListener("touchstart", this.formatter._onTouchScrollStart, { passive: !1 }), o.addEventListener("touchmove", this.formatter._onTouchScrollMove, { passive: !1 }), this.unclickableProxies[e] = {
      unclickable: t,
      proxyImage: o
    }, this.formatter.options.debug && console.debug("UnclickableBlotSpec created proxy for unclickable:", t, "with ID:", e, "and proxy image:", o);
  };
  /**
   * Repositions proxy images to overlay their corresponding "unclickable" elements
   * within the Quill editor container. Calculates each unclickable element's position
   * relative to the container, accounting for scroll offsets, and updates the proxy image's
   * style properties (`left`, `top`, `width`, `height`) accordingly.
   *
   * Handles errors gracefully by logging any issues encountered during positioning.
   *
   * @private
   */
  _repositionProxyImages = () => {
    if (Object.keys(this.unclickableProxies).length > 0) {
      const t = this.formatter.quill.container.getBoundingClientRect(), e = this.formatter.quill.container.scrollLeft, i = this.formatter.quill.container.scrollTop;
      Object.entries(this.unclickableProxies).forEach(([s, { unclickable: o, proxyImage: n }]) => {
        try {
          const r = o.getBoundingClientRect();
          Object.assign(
            n.style,
            {
              // display: 'block',
              left: `${r.left - t.left - 1 + e}px`,
              top: `${r.top - t.top + i}px`,
              width: `${r.width}px`,
              height: `${r.height}px`
            }
          );
        } catch (r) {
          const l = `Error positioning proxy image with id ${s}: `;
          console.error(l, `${r instanceof Error ? r.message : r}`);
        }
      });
    }
  };
  /**
   * Handles click events on proxy images representing unclickable blots.
   * Retrieves the associated unclickable blot using the proxy's dataset ID,
   * updates the `unclickable` property, and displays the formatter overlay.
   *
   * @param event - The mouse event triggered by clicking the proxy image.
   */
  _onProxyImageClick = (t) => {
    const i = t.target.dataset.blotFormatterId;
    this.unclickable = this.unclickableProxies[`${i}`].unclickable, this.formatter.show(this);
  };
  /**
   * Creates a proxy container element (`div`) with the class 'proxy-container' and appends it
   * to the Quill editor's container. This container is used to hold all proxy images.
   *
   * @returns {HTMLElement} The newly created proxy container element.
   * @private
   */
  _createProxyContainer = () => {
    const t = document.createElement("div");
    return t.classList.add("proxy-container"), this.formatter.quill.container.appendChild(t), t;
  };
}
class K extends Y {
  constructor(t) {
    super(t);
  }
}
class Q extends v {
  modal;
  targetElement = null;
  currentBlot = null;
  constructor(t) {
    super(t), this.toolbarButtons = [
      new A(
        "attribute",
        this._onClickHandler,
        this.formatter.options.toolbar
      )
    ], this.modal = this._createModal();
  }
  /**
   * Initializes the target element and current blot for the action.
   * Retrieves the target element and blot from the current formatter specification.
   *
   * @remarks
   * This method should be called when the action is created to ensure
   * that the necessary references are set up for further processing.
   */
  onCreate = () => {
    this.targetElement = this.formatter.currentSpec?.getTargetElement(), this.currentBlot = this.formatter.currentSpec?.getTargetBlot();
  };
  /**
   * Cleans up resources when the action is destroyed.
   * Sets the target element to null and removes the modal element from the DOM.
   */
  onDestroy = () => {
    this.targetElement = null, this.modal.form.removeEventListener("submit", this._onSubmitHandler), this.modal.form.removeEventListener("cancel", this._hideAltTitleModal), this.modal.element.removeEventListener("pointerdown", this._onPointerDownHandler), this.modal.cancelButton.removeEventListener("click", this._hideAltTitleModal), this.modal.element.remove();
  };
  /**
   * Event handler for click events that triggers the display of the Alt Title modal.
   * 
   * @private
   * @remarks
   * This handler is assigned to UI elements to allow users to edit or view the Alt Title attribute.
   */
  _onClickHandler = () => {
    this._showAltTitleModal();
  };
  /**
   * Displays the modal for editing the 'alt' and 'title' attributes of the target element.
   * 
   * If a target element is present, this method sets the modal's input fields to the current
   * 'alt' and 'title' attribute values of the target element (or empty strings if not set),
   * and appends the modal element to the document body.
   *
   * @private
   */
  _showAltTitleModal = () => {
    this.targetElement && (this.modal.altInput.value = this.targetElement.getAttribute("alt") || "", this.modal.titleInput.value = this.targetElement.getAttribute("title") || "", document.body.append(this.modal.element), this.formatter.options.debug && console.debug("Showing Alt Title modal for:", this.targetElement));
  };
  /**
   * Hides and removes the alt/title modal from the DOM.
   *
   * This method removes the modal's element, effectively closing the modal UI.
   * It is typically called when the modal should no longer be visible to the user.
   *
   * @private
   */
  _hideAltTitleModal = () => {
    this.modal.element.remove();
  };
  /**
   * Updates the `alt` and `title` attributes of the target image element based on user input.
   * If a title is provided, it sets the `title` attribute; otherwise, it removes it.
   * Additionally, if an image alignment format is applied, it updates the alignment format
   * to include the new title value.
   *
   * @private
   */
  _setAltTitle = () => {
    if (this.targetElement) {
      const t = typeof this.modal.altInput.value == "string" ? this.modal.altInput.value : "", e = this.modal.titleInput.value;
      this.targetElement.setAttribute("alt", t), e ? this.targetElement.setAttribute("title", e) : this.targetElement.removeAttribute("title"), this.formatter.options.debug && console.debug("Setting alt:", t, "title:", e, "on target element:", this.targetElement);
      const i = this.currentBlot?.parent?.formats()[this.formatter.ImageAlign.attrName]?.align;
      this.currentBlot && i && (this.formatter.options.debug && console.debug("Updating title of image with alignment:", i), this.currentBlot.parent?.format(this.formatter.ImageAlign.attrName, !1), this.currentBlot.format(
        this.formatter.ImageAlign.attrName,
        {
          align: i,
          title: e
        }
      ));
    }
  };
  /**
   * Creates and configures a modal dialog for editing image `alt` and `title` attributes.
   *
   * The modal includes:
   * - A unique identifier for each instance.
   * - A form with labeled textareas for `alt` and `title` values.
   * - Submit and cancel buttons, with customizable icons and styles.
   * - Event listeners for submitting, cancelling, and closing the modal by clicking outside.
   *
   * Styles and labels are sourced from `this.formatter.options.image.altTitleModalOptions` and `this.formatter.options.overlay.labels`.
   *
   * @returns {AltTitleModal} An object containing references to the modal element, form, alt and title inputs, and the cancel button.
   */
  _createModal = () => {
    const t = Array.from(
      crypto.getRandomValues(new Uint8Array(5)),
      (g) => String.fromCharCode(97 + g % 26)
    ).join(""), e = document.createElement("div");
    e.id = `${t}-modal`, e.setAttribute("data-blot-formatter-modal", "");
    const i = document.createElement("div"), s = document.createElement("form");
    s.id = `${t}-form`;
    const o = document.createElement("label");
    o.setAttribute("for", "alt"), o.textContent = this.formatter.options.overlay.labels?.alt || this.formatter.options.image.altTitleModalOptions.labels.alt;
    const n = document.createElement("textarea");
    n.name = "alt", n.rows = 3;
    const r = document.createElement("label");
    r.setAttribute("for", "title"), r.textContent = this.formatter.options.overlay.labels?.title || this.formatter.options.image.altTitleModalOptions.labels.title;
    const l = document.createElement("textarea");
    l.name = "title", l.rows = 3;
    const p = document.createElement("div"), m = document.createElement("button");
    m.type = "submit", m.innerHTML = this.formatter.options.image.altTitleModalOptions.icons.submitButton, p.appendChild(m), s.appendChild(o), s.appendChild(n), s.appendChild(r), s.appendChild(l), s.appendChild(p);
    const u = document.createElement("button");
    return u.id = `${t}-cancel`, u.type = "button", u.innerHTML = this.formatter.options.image.altTitleModalOptions.icons.cancelButton, this.formatter.options.image.altTitleModalOptions.styles && (Object.assign(e.style, this.formatter.options.image.altTitleModalOptions.styles.modalBackground), Object.assign(i.style, this.formatter.options.image.altTitleModalOptions.styles.modalContainer), Object.assign(o.style, this.formatter.options.image.altTitleModalOptions.styles.label), Object.assign(n.style, this.formatter.options.image.altTitleModalOptions.styles.textarea), Object.assign(r.style, this.formatter.options.image.altTitleModalOptions.styles.label), Object.assign(l.style, this.formatter.options.image.altTitleModalOptions.styles.textarea), Object.assign(m.style, this.formatter.options.image.altTitleModalOptions.styles.submitButton), Object.assign(u.style, this.formatter.options.image.altTitleModalOptions.styles.cancelButton)), i.appendChild(s), i.appendChild(u), e.appendChild(i), s.addEventListener("submit", this._onSubmitHandler), s.addEventListener("cancel", this._hideAltTitleModal), e.addEventListener("pointerdown", this._onPointerDownHandler), u.addEventListener("click", this._hideAltTitleModal), {
      element: e,
      form: s,
      altInput: n,
      titleInput: l,
      cancelButton: u
    };
  };
  _onSubmitHandler = (t) => {
    t.preventDefault(), this._setAltTitle(), this._hideAltTitleModal();
  };
  _onPointerDownHandler = (t) => {
    t.target === this.modal.element && this._hideAltTitleModal();
  };
}
class w extends v {
  options;
  modal;
  targetElement = null;
  imageDetails = null;
  /**
   * Determines whether the given HTML element is eligible for image compression.
   *
   * Eligibility criteria:
   * - The element must be an `<img>` tag.
   * - The image source must be a data URL (`data:image/`).
   * - The image must not be an SVG (`svg+xml`) or GIF (`gif`).
   *
   * @param targetElement - The HTML element to check for compression eligibility.
   * @returns `true` if the element is an eligible image for compression, otherwise `false`.
   */
  static isEligibleForCompression = (t, e = !1) => {
    let i = !1;
    if (t instanceof HTMLImageElement && t.src.startsWith("data:image/")) {
      const s = t.src.substring(5, t.src.indexOf(";"));
      i = s !== "svg+xml" && s !== "gif";
    }
    return e && console.debug("Image eligibility check:", {
      element: t,
      isEligible: i
    }), i;
  };
  constructor(t) {
    super(t), this.options = this.formatter.options.image.compressorOptions, this.toolbarButtons = [
      new A(
        "compress",
        this._onClickHandler,
        this.formatter.options.toolbar
      )
    ], this.modal = this._createModal();
  }
  /**
   * Initializes the CompressAction by setting the target element and updating the initial visibility
   * of the first toolbar button based on whether the target element is eligible for compression.
   *
   * This method should be called when the action is created. It ensures that the toolbar button
   * reflects the current eligibility state of the target element.
   */
  onCreate = () => {
    this.targetElement = this.formatter.currentSpec?.getTargetElement();
    const t = w.isEligibleForCompression(this.targetElement, this.debug);
    this.toolbarButtons[0].initialVisibility = t, this.debug && console.debug("CompressAction initialized with target element:", this.targetElement, "is eligible:", t);
  };
  /**
   * Cleans up resources when the action is destroyed.
   * Sets the target element to null and hides the modal dialog.
   */
  onDestroy = () => {
    this.targetElement = null, this._hideModal(), this.modal.continueButton.removeEventListener("click", this._onContinueClick), this.modal.moreInfoButton.removeEventListener("click", this._onMoreInfoClick), this.modal.cancelButton.removeEventListener("click", this._hideModal), this.modal.element.removeEventListener("pointerdown", this._onBackgroundClick);
  };
  /**
   * Handles the click event for the compress action.
   * When triggered, it displays the modal dialog for compression options.
   *
   * @param event - The click event object.
   */
  _onClickHandler = () => {
    this._showModal();
  };
  /**
   * Displays a modal dialog for image compression if the target element is an image.
   * If the image can be compressed, shows additional information and appends the modal to the document body.
   * Otherwise, displays feedback indicating that no compression is possible.
   *
   * @private
   */
  _showModal = () => {
    this.targetElement instanceof HTMLImageElement && (this.imageDetails = this._getImageDetails(this.targetElement), this.imageDetails.canCompress ? (this.modal.moreInfoButton.style.visibility = "visible", this.modal.moreInfoText.style.display = "none", document.body.append(this.modal.element)) : this._displayFeedback(this.options.text.nothingToDo));
  };
  /**
   * Removes the modal element from the DOM, effectively hiding the modal.
   *
   * @private
   */
  _hideModal = () => {
    this.modal.element.remove();
  };
  /**
   * Parses the `width` and `height` attributes of an HTMLImageElement and returns their numeric values.
   * Handles values specified in pixels (`px`), percentages (`%`), em/rem units, or plain numbers.
   * If the attribute is a percentage, uses the maximum width from options if available.
   * For em/rem units, assumes 16px per unit.
   * If the height is not specified or cannot be parsed, attempts to calculate it using the aspect ratio
   * from the image's natural dimensions if width is available.
   * 
   * @param img - The HTMLImageElement whose dimensions are to be parsed.
   * @returns A tuple containing the parsed width and height as numbers, or `null` if parsing fails.
   */
  _parseDimensions = (t) => {
    let e = t.getAttribute("width"), i = t.getAttribute("height"), s = null, o = null;
    if (e)
      if (e.toLowerCase().endsWith("px"))
        s = parseFloat(e);
      else if (e.endsWith("%"))
        s = this.options.maxWidth ?? null;
      else if (e.toLowerCase().endsWith("em") || e.toLowerCase().endsWith("rem"))
        s = parseFloat(e) * 16;
      else if (!isNaN(parseFloat(e)))
        s = parseFloat(e);
      else
        return [null, null];
    if (i)
      if (!isNaN(parseFloat(i)))
        o = parseFloat(i);
      else if (i.toLowerCase().endsWith("px"))
        o = parseFloat(i);
      else if (i.toLowerCase().endsWith("em") || i.toLowerCase().endsWith("rem"))
        o = parseFloat(i) * 16;
      else if (s && t.naturalWidth > 0 && t.naturalHeight > 0)
        o = s / (t.naturalWidth / t.naturalHeight);
      else
        return [null, null];
    return [s, o];
  };
  /**
   * Calculates the approximate byte size of an image from its data URL.
   *
   * @param img - The HTMLImageElement whose size is to be determined.
   * @returns The size of the image in bytes if the `src` attribute is a valid base64-encoded data URL,
   *          or `null` if the `src` is not a valid image data URL or does not contain base64 data.
   */
  _getImageSize = (t) => {
    const e = t.getAttribute("src");
    if (!e || !e.startsWith("data:image/"))
      return null;
    const i = e.split(",")[1];
    return i ? Math.ceil(i.length * 3 / 4) : null;
  };
  /**
   * Displays a feedback message in the formatter's sizeInfo element.
   * The message is shown with full opacity, then fades out after 2.5 seconds.
   *
   * @param msg - The feedback message to display.
   */
  _displayFeedback = (t) => {
    this.formatter.sizeInfo.innerHTML = t, this.formatter.sizeInfo.style.transition = "", this.formatter.sizeInfo.style.opacity = "1", setTimeout(() => {
      this.formatter.sizeInfo.style.transition = "opacity 1s", this.formatter.sizeInfo.style.opacity = "0";
    }, 2500);
  };
  /**
   * Retrieves detailed information about an image element, including its natural and target dimensions,
   * file size, and whether it is eligible for compression based on the provided options.
   *
   * @param img - The HTMLImageElement to extract details from.
   * @returns An {@link ImageDetails} object containing the image's natural and target dimensions,
   *          file size, and compression eligibility.
   */
  _getImageDetails = (t) => {
    let [e, i] = this._parseDimensions(t);
    !e && (this.options.maxWidth ?? 1 / 0) < t.naturalWidth && (e = this.options.maxWidth, i = e / (t.naturalWidth / t.naturalHeight));
    const s = {
      naturalWidth: t.naturalWidth,
      naturalHeight: t.naturalHeight,
      targetWidth: e,
      targetHeight: i,
      size: this._getImageSize(t),
      canCompress: !!(e && i && e < t.naturalWidth && w.isEligibleForCompression(t, this.debug))
    };
    return this.debug && console.debug("Image details:", {
      element: t,
      ...s
    }), s;
  };
  /**
   * Compresses a given HTMLImageElement by resizing it to target dimensions and reducing its quality.
   * If compression results in a smaller image, the image's `src` is updated with the compressed data URL.
   * Displays feedback about the compression result, including size reduction and new dimensions.
   *
   * @param img - The HTMLImageElement to compress.
   * @returns `true` if the compression process was initiated, `false` if image loading failed.
   *
   * @remarks
   * - Compression only occurs if `imageDetails.canCompress` is `true`.
   * - The image is resized to `imageDetails.targetWidth` and `imageDetails.targetHeight`.
   * - JPEG quality is determined by `options.jpegQuality`.
   * - Feedback is displayed using `_displayFeedback`.
   * - If compression is not possible, a "nothing to do" message is shown.
   */
  _compressImage = (t) => {
    if (this.imageDetails?.canCompress) {
      const e = new Image();
      e.src = t.src, e.onload = () => {
        this.debug && console.debug("Compressing Image Copy loaded:", e);
        const i = document.createElement("canvas");
        i.width = this.imageDetails.targetWidth, i.height = this.imageDetails.targetHeight, i.getContext("2d").drawImage(e, 0, 0, i.width, i.height);
        const o = i.toDataURL("image/jpeg", this.options.jpegQuality), n = new TextEncoder().encode(t.src).length, r = new TextEncoder().encode(o).length;
        r < n && (t.src = o);
        const l = `${Math.ceil((this.imageDetails.size - this._getImageSize(t)) / 1024)}kB`, p = `${this.options.text.reducedLabel}: ${l}<br>
                            ${this.imageDetails.naturalWidth} x ${this.imageDetails.naturalHeight}px → ${i.width} x ${Math.round(i.height)}px
                        `;
        return this.debug && console.debug("Image compressed:", {
          "original size": n,
          "resized size": r,
          "size diff": l,
          "new dimensions": { width: i.width, height: Math.round(i.height) }
        }), this._displayFeedback(p), !0;
      }, e.onerror = (i) => (console.error("Image loading failed:", i), this._displayFeedback(`Image loading failed: ${i}`), !1);
    } else
      this._displayFeedback(this.options.text.nothingToDo);
    return !0;
  };
  /**
   * Creates and configures a modal dialog for the compress action.
   *
   * The modal includes a prompt, an optional "more info" section, and three buttons:
   * Cancel, More Info, and Continue. Styles and content are applied based on the
   * provided options. Event listeners are attached to handle user interactions:
   * - Continue: triggers image compression and hides the modal.
   * - More Info: displays additional information and hides the button.
   * - Cancel: hides the modal.
   * - Clicking the background: hides the modal if the background itself is clicked.
   *
   * @returns {CompressModal} An object containing the modal background element,
   *          the "More Info" button, and the "More Info" text element.
   */
  _createModal = () => {
    const t = document.createElement("div");
    t.setAttribute("data-blot-formatter-compress-modal", "");
    const e = document.createElement("div"), i = document.createElement("div"), s = document.createElement("div"), o = document.createElement("div"), n = document.createElement("button"), r = document.createElement("button"), l = document.createElement("button");
    return s.style.display = "none", o.append(n, r, l), e.append(i, s, o), t.appendChild(e), i.innerHTML = this.options.text.prompt, s.innerHTML = this.options.text.moreInfo || "", this.options.styles && (Object.assign(t.style, this.options.styles.modalBackground), Object.assign(e.style, this.options.styles.modalContainer), Object.assign(o.style, this.options.styles.buttonContainer), Object.assign(n.style, { ...this.options.styles.buttons, ...this.options.buttons.cancel.style }), this.options.text.moreInfo ? Object.assign(r.style, { ...this.options.styles.buttons, ...this.options.buttons.moreInfo.style }) : r.style.visibility = "hidden", Object.assign(l.style, { ...this.options.styles.buttons, ...this.options.buttons.continue.style })), n.innerHTML = this.options.icons.cancel, r.innerHTML = this.options.icons.moreInfo, l.innerHTML = this.options.icons.continue, l.addEventListener("click", this._onContinueClick), r.addEventListener("click", this._onMoreInfoClick), n.addEventListener("click", this._hideModal), t.addEventListener("pointerdown", this._onBackgroundClick), {
      element: t,
      moreInfoButton: r,
      cancelButton: n,
      continueButton: l,
      moreInfoText: s
    };
  };
  _onContinueClick = () => {
    this.targetElement instanceof HTMLImageElement && this._compressImage(this.targetElement), this._hideModal();
  };
  _onMoreInfoClick = () => {
    this.modal.moreInfoText.innerHTML = this.options.text.moreInfo || "", this.modal.moreInfoText.style.display = "block", this.modal.moreInfoButton.style.visibility = "hidden";
  };
  _onBackgroundClick = (t) => {
    t.stopImmediatePropagation(), t.target === this.modal.element && (this.debug && console.debug("Modal background clicked, hiding modal"), this._hideModal());
  };
}
class Z extends v {
  targetElement = null;
  currentBlot = null;
  toolbarButton;
  linkOptions;
  modal;
  constructor(t) {
    super(t), this.linkOptions = this.formatter.options.image.linkOptions, this.toolbarButton = new A(
      "link",
      this._onClickHandler,
      this.formatter.options.toolbar
    ), this.toolbarButton.preselect = () => !!this.getLink(), this.toolbarButtons = [this.toolbarButton], window.LinkAction = this;
  }
  /**
   * Initializes the action by setting the `targetElement` property.
   * Retrieves the target element from the current formatter specification, if available.
   * This method is typically called when the action is created.
   */
  onCreate = () => {
    this.targetElement = this.formatter.currentSpec?.getTargetElement(), this.currentBlot = this.formatter.currentSpec?.getTargetBlot();
  };
  /**
   * Cleans up resources when the action is destroyed.
   * - Sets the target element to null.
   * - Removes any attached event listeners.
   * - Hides the link modal if it is visible.
   */
  onDestroy = () => {
    this.targetElement = null, this._removeEventListeners(), this.hideLinkModal();
  };
  /**
   * Attaches all necessary event listeners to the modal elements for handling
   * link-related actions such as submitting the form, blocking certain key events,
   * handling input changes, canceling, removing links, and managing background/context menu interactions.
   *
   * This method should be called after the modal elements are initialized to ensure
   * proper event handling within the link modal dialog.
   * 
   * @private
   */
  _addEventListeners = () => {
    this.modal && (this.modal.form.addEventListener("submit", this._formSubmitHandler), this.modal.cancelButton.addEventListener("click", this.hideLinkModal), this.modal.removeButton.addEventListener("click", this.removeLink), this.modal.background.addEventListener("click", this._onBackgroundClick), this.modal.input.addEventListener("contextmenu", this._trapContextEvent));
  };
  /**
   * Removes all event listeners attached to the modal elements.
   * 
   * This method detaches event handlers from the modal's dialog, form, input,
   * cancel button, remove button, background, and input context menu to prevent
   * memory leaks and unintended behavior when the modal is no longer in use.
   * 
   * @private
   */
  _removeEventListeners = () => {
    this.modal && (this.modal.form.removeEventListener("submit", this._formSubmitHandler), this.modal.cancelButton.removeEventListener("click", this.hideLinkModal), this.modal.removeButton.removeEventListener("click", this.removeLink), this.modal.background.removeEventListener("click", this._onBackgroundClick), this.modal.input.removeEventListener("contextmenu", this._trapContextEvent));
  };
  /**
   * Prevents the event from propagating further in the event chain.
   * This method is typically used to trap context menu or similar events,
   * ensuring that no other event listeners are triggered for the same event.
   *
   * @param e - The event to be stopped.
   */
  _trapContextEvent = (t) => {
    t.stopImmediatePropagation();
  };
  /**
   * Event handler that is triggered when the associated element is clicked.
   * Invokes the `showLinkModal` method to display the link editing modal.
   *
   * @private
   * @remarks
   * This handler is typically bound to a UI element to allow users to edit or add links.
   */
  _onClickHandler = () => {
    this.showLinkModal();
  };
  /**
   * Handles click events on the modal background.
   * 
   * If the click event's target is the modal background, this method prevents the default behavior,
   * stops the event from propagating further, and hides the link modal.
   *
   * @param e - The mouse event triggered by the user's click.
   */
  _onBackgroundClick = (t) => {
    t.target === this.modal?.background && (t.stopImmediatePropagation(), t.preventDefault(), this.hideLinkModal(), this.debug && console.debug("LinkAction modal background clicked, hiding modal"));
  };
  /**
   * Displays the link modal dialog for editing or inserting a link.
   * 
   * If a target element is present, this method constructs the modal,
   * appends it to the formatter's overlay, and sets up necessary event listeners.
   * The modal is initially hidden to prevent flicker, then shown after being
   * positioned correctly relative to the target element.
   *
   * @returns {void}
   */
  showLinkModal = () => {
    if (this.targetElement) {
      if (this.modal = this._buildModal(), !this.modal) return;
      this.formatter.overlay.append(this.modal.dialog, this.modal.background), this._addEventListeners(), this.modal.dialog.style.visibility = "hidden", this.modal.dialog.show(), this._positionModal(this.modal.dialog), this.modal.dialog.style.visibility = "visible", this.modal.input.focus(), this.modal.input.select();
    }
  };
  /**
   * Builds and returns the modal elements used for editing or inserting a link.
   *
   * This method creates a dialog element containing a form with a label, input field for the URL,
   * and three buttons: OK (submit), Remove, and Cancel. It also creates a background mask element.
   * All elements are styled and configured according to the `linkOptions` provided to the class.
   *
   * @returns An object containing references to the created modal elements:
   * - `dialog`: The dialog element that serves as the modal container.
   * - `background`: The background mask element for the modal.
   * - `form`: The form element inside the dialog.
   * - `label`: The label element for the input.
   * - `input`: The input element for entering the link URL.
   * - `okButton`: The submit button for confirming the link.
   * - `cancelButton`: The button for cancelling the operation.
   * - `removeButton`: The button for removing the link.
   */
  _buildModal = () => {
    const t = document.createElement("dialog");
    t.className = this.linkOptions.modal.dialog.className, t.dataset.blotFormatterModal = "", Object.assign(t.style, this.linkOptions.modal.dialog.style);
    const e = document.createElement("form");
    e.method = "dialog", e.className = this.linkOptions.modal.form.className, Object.assign(e.style, this.linkOptions.modal.form.style);
    const i = document.createElement("label");
    i.htmlFor = "link-url", i.textContent = this.linkOptions.modal.label.text, i.className = this.linkOptions.modal.label.className, Object.assign(i.style, this.linkOptions.modal.label.style);
    const s = document.createElement("input");
    s.type = "url", s.id = "link-url", s.name = "url", s.value = this.getLink() || "", s.select(), s.autofocus = !0, s.className = this.linkOptions.modal.input.className, Object.assign(s.style, this.linkOptions.modal.input.style), s.placeholder = this.linkOptions.modal.input.placeholder || "";
    const o = document.createElement("button");
    o.type = "submit", o.innerHTML = this.linkOptions.modal.buttons.submit.icon, o.className = this.linkOptions.modal.buttons.submit.className, Object.assign(o.style, this.linkOptions.modal.buttons.submit.style);
    const n = document.createElement("button");
    n.type = "button", n.innerHTML = this.linkOptions.modal.buttons.cancel.icon, n.className = this.linkOptions.modal.buttons.cancel.className, Object.assign(n.style, this.linkOptions.modal.buttons.cancel.style);
    const r = document.createElement("button");
    r.type = "button", r.innerHTML = this.linkOptions.modal.buttons.remove.icon, r.className = this.linkOptions.modal.buttons.remove.className, Object.assign(r.style, this.linkOptions.modal.buttons.remove.style), e.appendChild(i), e.appendChild(s), e.appendChild(o), e.appendChild(r), e.appendChild(n), t.appendChild(e);
    const l = document.createElement("div");
    return l.className = this.linkOptions.modal.background.className || "", Object.assign(l.style, this.linkOptions.modal.background.style), {
      dialog: t,
      background: l,
      form: e,
      label: i,
      input: s,
      okButton: o,
      cancelButton: n,
      removeButton: r
    };
  };
  /**
   * Positions the given dialog element centered over the formatter's overlay,
   * ensuring it stays within the bounds of the Quill editor root element.
   *
   * The method calculates the overlay and Quill root bounding rectangles,
   * determines the dialog's dimensions, and computes the appropriate
   * `left` and `top` CSS properties to center the dialog over the overlay.
   * The horizontal & vertical position is clamped so the dialog does not overflow
   * the Quill root element.
   *
   * @param dialog - The HTMLDialogElement to position.
   */
  _positionModal = (t) => {
    const e = this.formatter.overlay.getBoundingClientRect(), i = this.formatter.quill.root.getBoundingClientRect(), s = t.offsetParent?.getBoundingClientRect() ?? { top: 0, left: 0 }, o = t.offsetWidth, n = t.offsetHeight;
    let r = e.left + e.width / 2 - o / 2 - s.left, l = e.top + e.height / 2 - n / 2 - s.top;
    const p = i.left - s.left, m = i.right - o - s.left;
    r = Math.min(Math.max(r, p), m);
    const u = i.top - s.top, g = i.bottom - n - s.top;
    l = Math.min(Math.max(l, u), g), t.style.position = "absolute", t.style.left = `${r}px`, t.style.top = `${l}px`;
  };
  /**
   * Hides and cleans up the link modal dialog.
   *
   * This method closes and removes the modal dialog and its background overlay if they exist,
   * removes any associated event listeners, and resets the modal reference to undefined.
   */
  hideLinkModal = () => {
    this.modal?.dialog?.open && this.modal.dialog.close(), this.modal?.dialog?.remove(), this.modal?.background && this.modal.background.remove(), this._removeEventListeners(), this.modal = void 0;
  };
  /**
   * Handles the form submission event for the link action.
   * 
   * Prevents the default form submission behavior, extracts the URL from the form data,
   * and applies or removes a link on the current blot based on the URL's presence.
   *
   * @param event - The form submission event.
   */
  _formSubmitHandler = (t) => {
    t.preventDefault();
    const e = t.target, s = new FormData(e).get("url").trim();
    this.debug && console.debug("LinkAction form submitted with URL:", s), this.currentBlot && (s ? this.applyLink(s) : this.removeLink());
  };
  /**
   * Retrieves the link format associated with the current blot, if any.
   *
   * @returns {any | null} The link URL if the current blot has a link format, otherwise `null`.
   *
   * @remarks
   * This method checks if the current blot exists and has a DOM node. It then retrieves the index of the blot
   * in the Quill editor and fetches its formats. If a link format is present, it returns the link value; otherwise, it returns `null`.
   */
  getLink = () => {
    const t = this.currentBlot;
    if (!t || !t.domNode) return null;
    const e = this.formatter.quill.getIndex(t), i = this.formatter.quill.getFormat(e, 1, this.formatter.Quill.sources.SILENT);
    return this.debug && console.debug("LinkAction getLink called, formats:", i), i.link || null;
  };
  /**
   * Removes the link format from the current image blot's parent wrapper, if present.
   * 
   * Traverses up the blot hierarchy from the current image blot to find a parent blot
   * with a 'link' format. If found, it removes the link format from that wrapper.
   * After removing the link, it hides the link modal and deselects the toolbar button.
   *
   * @returns {void}
   */
  removeLink = () => {
    const t = this.currentBlot;
    if (!t || !t.domNode) return;
    let e = t.parent;
    for (; e && typeof e.formats == "function"; ) {
      if (e.formats().link) {
        e.format("link", null);
        break;
      }
      e = e.parent;
    }
    this.debug && console.debug("LinkAction removeLink called, removed link from blot:", e), this.hideLinkModal(), this.toolbarButton.selected = !1;
  };
  /**
   * Applies a link to the current blot if the provided URL is different from the existing link.
   * Removes any existing link, formats the current blot with the new link, and updates the toolbar button state.
   * Hides the link modal after applying the link.
   *
   * @param url - The URL to apply as a link to the current blot.
   */
  applyLink = (t) => {
    t !== this.getLink() && (this.removeLink(), this.currentBlot?.format("link", t), this.toolbarButton.selected = !!t), this.hideLinkModal();
  };
}
class G extends z {
  img;
  constructor(t) {
    super(t), this.img = null;
  }
  /**
   * Initializes the image spec by attaching a click event listener to the Quill editor's root element.
   * The event listener triggers the `onClick` handler when the root element is clicked.
   */
  init = () => {
    this.formatter.quill.root.addEventListener("click", this.onClick);
  };
  /**
   * Returns an array of available actions for the image spec, based on the current formatter options and image eligibility.
   *
   * The returned actions may include:
   * - `LinkAction`: If link editing is allowed (`image.linkOptions.allowLinkEdit`).
   * - `AttributeAction`: If alt/title editing is allowed (`image.allowAltTitleEdit`).
   * - `CompressAction`: If compression is allowed (`image.allowCompressor`) and the image is eligible for compression.
   *
   * @returns {Array<Action>} The list of actions applicable to the current image spec.
   */
  getActions = () => {
    const t = super.getActions();
    return this.formatter.options.image.linkOptions.allowLinkEdit && t.push(new Z(this.formatter)), this.formatter.options.image.allowAltTitleEdit && t.push(new Q(this.formatter)), this.formatter.options.image.allowCompressor && w.isEligibleForCompression(this.img) && t.push(new w(this.formatter)), t;
  };
  /**
   * Returns the target HTML element associated with this instance.
   *
   * @returns {HTMLElement | null} The image element if available, otherwise `null`.
   */
  getTargetElement = () => this.img;
  /**
   * Handles the hide event by resetting the image reference to null.
   * This is typically called when the overlay should no longer be displayed or interacted with.
   */
  onHide = () => {
    this.img = null;
  };
  /**
   * Handles click events on image elements.
   * 
   * If the clicked element is an HTMLImageElement, prevents the default behaviour
   * (such as opening links), stores a reference to the image, and displays the formatter UI.
   * 
   * @param event - The mouse event triggered by the click.
   */
  onClick = (t) => {
    const e = t.target;
    e instanceof HTMLImageElement && (t.stopImmediatePropagation(), t.preventDefault(), this.img = e, this.formatter.show(this));
  };
}
const E = '<svg viewBox="0 0 16 16" fill="currentColor" style="height:100%;width:auto"><path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708"/></svg>', L = '<svg viewBox="0 0 24 24" fill="currentcolor" style="height:100%;width:auto"><path fill-rule="evenodd" clip-rule="evenodd" d="M 12,24 C 6.34314,24 3.514716,24 1.757364,22.2426 0,20.48532 0,17.6568 0,12 0,6.34314 0,3.514716 1.757364,1.757364 3.514716,0 6.34314,0 12,0 17.6568,0 20.48532,0 22.2426,1.757364 24,3.514716 24,6.34314 24,12 24,17.6568 24,20.48532 22.2426,22.2426 20.48532,24 17.6568,24 12,24 Z M 16.83636,8.363604 c 0.35148,0.351468 0.35148,0.921324 0,1.272756 l -6,6 c -0.35148,0.35148 -0.92124,0.35148 -1.272756,0 l -2.4,-2.4 c -0.351468,-0.35148 -0.351468,-0.92124 0,-1.27272 0.351468,-0.35148 0.921324,-0.35148 1.272792,0 L 10.2,13.72716 15.56364,8.363604 c 0.35148,-0.351468 0.92124,-0.351468 1.27272,0 z" style="stroke-width:1.2" /></svg>', J = '<svg viewBox="0 0 512 512" fill="currentcolor" style="height:100%;width:auto"><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm169.8-90.7c7.9-22.3 29.1-37.3 52.8-37.3l58.3 0c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24l0-13.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1l-58.3 0c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" /></svg>', M = {
  specs: [
    G,
    K
  ],
  overlay: {
    className: "blot-formatter__overlay",
    style: {
      position: "absolute",
      boxSizing: "border-box",
      border: "1px dashed #444",
      backgroundColor: "rgba(255, 255, 255, 0.35)",
      maxWidth: "100%"
    },
    sizeInfoStyle: {
      position: "absolute",
      color: "rgba(255, 255, 255, 0.7)",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      padding: "1em",
      textWrap: "nowrap",
      fontSize: "1rem",
      opacity: 0,
      lineHeight: 1.2
    }
  },
  align: {
    allowAligning: !0,
    alignments: ["left", "center", "right"]
  },
  resize: {
    allowResizing: !0,
    allowResizeModeChange: !1,
    imageOversizeProtection: !1,
    handleClassName: "blot-formatter__resize-handle",
    handleStyle: {
      position: "absolute",
      height: "12px",
      width: "12px",
      backgroundColor: "white",
      border: "1px solid #777",
      boxSizing: "border-box",
      opacity: "0.80",
      zIndex: 999
    },
    useRelativeSize: !1,
    minimumWidthPx: 25
  },
  delete: {
    allowKeyboardDelete: !0
  },
  toolbar: {
    icons: {
      left: '<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="3" x2="15" y1="9" y2="9"></line><line class="ql-stroke" x1="3" x2="13" y1="14" y2="14"></line><line class="ql-stroke" x1="3" x2="9" y1="4" y2="4"></line></svg>',
      center: '<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="15" x2="3" y1="9" y2="9"></line><line class="ql-stroke" x1="14" x2="4" y1="14" y2="14"></line><line class="ql-stroke" x1="12" x2="6" y1="4" y2="4"></line></svg>',
      right: '<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="15" x2="3" y1="9" y2="9"></line><line class="ql-stroke" x1="15" x2="5" y1="14" y2="14"></line><line class="ql-stroke" x1="15" x2="9" y1="4" y2="4"></line></svg>',
      attribute: '<svg viewBox="0 0 24 24" fill="none" class="ql-stroke"><path d="M10 19H12M12 19H14M12 19V5M12 5H6V6M12 5H18V6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      resizeMode: '<svg viewBox="0 0 24 24" class="ql-stroke"><path d="m 7.7056591,11.853515 q -1.515179,0 -2.4160962,-0.993056 -0.9009172,-1.0032944 -0.9009172,-2.6720388 0,-1.8223098 0.9521057,-2.8665548 0.9521057,-1.0544826 2.5696616,-1.0544826 1.5663674,0 2.426334,0.9725811 0.870204,0.972581 0.870204,2.7334647 0,1.7608836 -0.972581,2.8256044 -0.9623435,1.054482 -2.5287109,1.054482 z M 7.8489868,5.3935293 q -0.9725811,0 -1.5356544,0.7268764 -0.5630732,0.7166387 -0.5630732,1.9758752 0,1.2387612 0.5528356,1.9349241 0.5528355,0.685926 1.5049412,0.685926 0.9623434,0 1.5049413,-0.716639 0.5425978,-0.7166384 0.5425978,-1.9861126 0,-1.2387612 -0.5425978,-1.9246868 Q 8.7806171,5.3935293 7.8489868,5.3935293 Z M 17.533847,4.4926121 8.1151669,19.275845 H 6.6511764 L 16.059619,4.4926121 Z M 16.448651,19.398697 q -1.515179,0 -2.416096,-1.003294 -0.900917,-1.003294 -0.900917,-2.661801 0,-1.82231 0.962343,-2.876793 0.962344,-1.06472 2.559424,-1.06472 1.55613,0 2.426334,0.982819 0.870204,0.982819 0.870204,2.75394 0,1.750646 -0.972581,2.815366 -0.962343,1.054483 -2.528711,1.054483 z m 0.143328,-6.449748 q -0.982819,0 -1.545892,0.716638 -0.552836,0.716639 -0.552836,1.986113 0,1.218286 0.552836,1.914449 0.552835,0.685926 1.504941,0.685926 0.962343,0 1.504941,-0.716639 0.542598,-0.726876 0.542598,-1.986113 0,-1.248998 -0.542598,-1.924686 -0.53236,-0.675688 -1.46399,-0.675688 z" style="fill:currentColor;stroke:currentColor;stroke-width:0.3"/></svg>',
      compress: '<svg viewBox="0 0 28 28"><path d="m 19.250001,9.3125004 c 0.240623,0 0.437498,0.1968749 0.437498,0.4374991 V 18.49453 l -0.136717,-0.177734 -3.718751,-4.812498 c -0.123046,-0.161329 -0.317188,-0.254297 -0.51953,-0.254297 -0.202345,0 -0.39375,0.09297 -0.519532,0.254297 l -2.269532,2.936715 -0.833984,-1.167577 c -0.123047,-0.172265 -0.319922,-0.273437 -0.533204,-0.273437 -0.213281,0 -0.410156,0.101172 -0.533202,0.276172 l -2.1875003,3.0625 -0.1230462,0.169532 v -0.0082 -8.7500002 c 0,-0.2406242 0.1968749,-0.4374991 0.4374991,-0.4374991 z M 8.7499996,8 C 7.7847663,8 7,8.7847662 7,9.7499995 V 18.5 c 0,0.965233 0.7847663,1.75 1.7499996,1.75 H 19.250001 C 20.215235,20.25 21,19.465233 21,18.5 V 9.7499995 C 21,8.7847662 20.215235,8 19.250001,8 Z M 10.9375,13.250001 a 1.3125025,1.312501 0 1 0 0,-2.625002 1.3125025,1.312501 0 1 0 0,2.625002 z" /><path d="m 25.298508,20 h -3.58209 C 21.286567,20 21,20.286571 21,20.716427 v 3.582131 c 0,0.429856 0.286567,0.716426 0.716418,0.716426 v 0 c 0.429851,0 0.716418,-0.28657 0.716418,-0.716426 v -2.865705 h 2.865672 c 0.429851,0 0.716418,-0.28657 0.716418,-0.716426 C 26.014926,20.286571 25.728359,20 25.298508,20 Z" /><path d="M 6.298508,20 H 2.716418 C 2.2865673,20 2,20.286571 2,20.716427 c 0,0.429856 0.2865673,0.716426 0.716418,0.716426 H 5.58209 v 2.865705 c 0,0.429856 0.286567,0.716426 0.716418,0.716426 v 0 c 0.429851,0 0.716418,-0.28657 0.716418,-0.716426 V 20.716427 C 7.014926,20.286571 6.728359,20 6.298508,20 Z" /><path d="M 6.298507,3 C 5.868656,3 5.582089,3.28657 5.582089,3.716426 V 6.582131 H 2.716417 C 2.286567,6.582131 2,6.868702 2,7.298557 2,7.728413 2.286567,8.014984 2.716417,8.014984 h 3.58209 c 0.429845,0 0.716412,-0.286571 0.716412,-0.716427 V 3.716426 C 7.014919,3.28657 6.728352,3 6.298507,3 Z" /><path d="m 21.716418,8.014984 h 3.582089 c 0.429851,0 0.716418,-0.286571 0.716418,-0.716427 0,-0.429855 -0.286567,-0.716426 -0.716418,-0.716426 H 22.432836 V 3.716426 C 22.432836,3.28657 22.146269,3 21.716418,3 21.286567,3 21,3.28657 21,3.716426 v 3.582131 c 0,0.429856 0.286567,0.716427 0.716418,0.716427 z" /></svg>',
      link: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" style="fill: none;stroke: #444;stroke-linecap: round;stroke-linejoin: round;stroke-width: 1.5;"><line x1="7" x2="11" y1="7" y2="11"/><path class="ql-even" d="M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z"/><path class="ql-even" d="M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z"/></svg>'
    },
    tooltips: {
      left: "Align Left",
      center: "Align Center",
      right: "Align Right",
      attribute: "Set Alt/Title",
      resizeMode: "Use Relative (%)/Absolute (px) Sizing",
      compress: "Compress Image",
      link: "Add/Edit Link"
    },
    mainClassName: "blot-formatter__toolbar",
    mainStyle: {
      position: "absolute",
      display: "flex",
      top: "0",
      right: "0",
      left: "0",
      transform: "translateY(-50%)",
      justifyContent: "center",
      flexWrap: "wrap",
      color: "#333",
      zIndex: "1"
    },
    buttonClassName: "blot-formatter__toolbar-button",
    buttonStyle: {
      display: "inline-block",
      width: "27px",
      height: "26px",
      background: "white",
      border: "1px solid #999",
      cursor: "pointer",
      margin: "0 -1px 0 0"
    },
    buttonSelectedClassName: "blot-formatter__toolbar-button--selected",
    buttonSelectedStyle: {
      filter: "invert(20%)"
    },
    svgStyle: {
      display: "inline-block",
      width: "100%",
      height: "100%",
      background: "white",
      verticalAlign: "top"
    }
  },
  image: {
    allowAltTitleEdit: !0,
    registerImageTitleBlot: !1,
    registerArrowRightFix: !0,
    altTitleModalOptions: {
      styles: {
        modalBackground: {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        },
        modalContainer: {
          backgroundColor: "#f2f2f2",
          padding: "5px 10px 10px 10px",
          borderRadius: "5px",
          position: "relative",
          width: "90%",
          maxWidth: "500px",
          boxShadow: "6px 6px 5px #00000075"
        },
        label: {
          display: "block",
          color: "black",
          margin: "7px 0 5px 0",
          fontSize: "14px"
        },
        textarea: {
          backgroundColor: "white",
          fontSize: "13px",
          display: "block",
          resize: "none",
          width: "100%",
          padding: "5px",
          border: "1px solid lightgray",
          borderRadius: "4px",
          boxSizing: "border-box"
        },
        submitButton: {
          display: "block",
          marginLeft: "auto",
          marginTop: "5px",
          cursor: "pointer",
          border: 0,
          padding: 0,
          width: "2rem",
          height: "2rem",
          color: "#198754"
        },
        cancelButton: {
          display: "flex",
          width: "1.5rem",
          height: "1.5rem",
          position: "absolute",
          padding: 0,
          top: "-0.7rem",
          right: "-0.7rem",
          background: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          alignItems: "center",
          color: "rgb(197, 74, 71)"
        }
      },
      icons: {
        submitButton: L,
        cancelButton: E
      },
      labels: {
        alt: "Alt Text",
        title: "Image Title"
      }
    },
    allowCompressor: !1,
    compressorOptions: {
      jpegQuality: 0.8,
      styles: {
        modalBackground: {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        },
        modalContainer: {
          backgroundColor: "rgb(253, 253, 253)",
          border: "1px solid #ccc",
          boxShadow: "6px 6px 5px #00000075",
          padding: "15px",
          borderRadius: "8px",
          position: "relative",
          maxWidth: "min(90%, 400px)",
          textAlign: "justify",
          userSelect: "none"
        },
        buttonContainer: {
          gridTemplateColumns: "auto 1fr auto",
          display: "grid",
          gap: "1em",
          justifyItems: "center",
          borderTop: "1px solid lightgray",
          paddingTop: "12px"
        },
        buttons: {
          width: "1.5rem",
          height: "1.5rem",
          padding: 0,
          backgroundColor: "transparent",
          border: 0,
          cursor: "pointer"
        }
      },
      buttons: {
        continue: {
          className: "blot-formatter__compress-continue",
          style: {
            color: "#198754"
          }
        },
        cancel: {
          className: "blot-formatter__compress-cancel",
          style: {
            color: "rgb(197, 74, 71)"
          }
        },
        moreInfo: {
          className: "blot-formatter__compress-more-info",
          style: {
            color: "royalblue"
          }
        }
      },
      text: {
        prompt: '<p style="font-style: large;margin: 0 0 0.5em;">Compress image to its resized width?</p>',
        moreInfo: '<p style="font-size: smaller; line-height: 1.2;">You can reduce the file size and save disk space by compressing pictures. The compression reduces both the file size and picture dimensions based on the width setting.</p><p style="font-size: smaller;"><strong>NOTE:</strong> This process cannot be undone.</p>',
        reducedLabel: "Reduced",
        nothingToDo: "Image already optimised."
      },
      icons: {
        cancel: `<span style="color: rgb(197, 74, 71);">${E}</span>`,
        moreInfo: J,
        continue: L
      }
    },
    linkOptions: {
      allowLinkEdit: !0,
      modal: {
        dialog: {
          className: "blot-formatter__link-modal",
          style: {
            // NOTE: positioning handled programatically
            margin: 0,
            backgroundColor: "#fdfdfd",
            border: "1px solid #ccc",
            boxShadow: "6px 6px 5px #00000075",
            color: "#444",
            padding: "6px 13px 6px 10px",
            whiteSpace: "nowrap",
            borderRadius: "5px",
            minWidth: "300px",
            maxWidth: "90%",
            overflow: "visible",
            zIndex: 101
            // Ensure it is above the background
          }
        },
        background: {
          className: "blot-formatter__link-modal-background",
          style: {
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 100
          }
        },
        form: {
          className: "blot-formatter__link-form",
          style: {
            display: "flex",
            flexWrap: "nowrap",
            columnGap: "5px",
            alignItems: "center",
            margin: 0
          }
        },
        label: {
          className: "blot-formatter__link-label",
          style: {
            paddingRight: "5px",
            fontSize: "13px"
          },
          text: "URL:"
        },
        input: {
          className: "blot-formatter__link-input",
          style: {
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxSizing: "border-box",
            fontSize: "13px",
            height: "26px",
            margin: "0 0.2rem 0 0",
            padding: "3px 5px",
            width: "100%",
            outline: "1px auto #df9001c2"
          },
          placeholder: "https://example.com"
        },
        buttons: {
          submit: {
            className: "blot-formatter__link-submit",
            style: {
              border: "none",
              borderRadius: "3px",
              padding: "0",
              cursor: "pointer",
              background: "transparent",
              width: "26px",
              height: "26px",
              color: "#198754",
              display: "flex",
              alignContent: "center",
              justifyContent: "center"
            },
            icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" style="height:100%;width:auto"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/><path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/></svg>',
            tooltip: "Create Link"
          },
          cancel: {
            className: "blot-formatter__link-cancel",
            style: {
              display: "flex",
              width: "18px",
              height: "18px",
              position: "absolute",
              top: "-8px",
              right: "-10px",
              padding: "0",
              background: "white",
              border: "1px solid rgb(157, 58, 56)",
              borderRadius: "5px",
              cursor: "pointer",
              alignItems: "center",
              color: "rgb(197, 74, 71)"
            },
            icon: E,
            tooltip: "Cancel"
          },
          remove: {
            className: "blot-formatter__link-remove",
            style: {
              border: "none",
              padding: "0",
              cursor: "pointer",
              background: "transparent",
              width: "26px",
              height: "26px",
              fill: "#c54a47",
              display: "flex",
              placeContent: "center",
              justifyContent: "center"
            },
            icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" viewBox="0 0 16 16" style="height:100%;width:auto"><path d="M 6.265625,3.3457031 6.125,3.625 H 4.25 c -0.3457031,0 -0.625,0.2792969 -0.625,0.625 0,0.3457031 0.2792969,0.625 0.625,0.625 h 7.5 c 0.345703,0 0.625,-0.2792969 0.625,-0.625 0,-0.3457031 -0.279297,-0.625 -0.625,-0.625 H 9.875 L 9.734375,3.3457031 C 9.6289062,3.1328125 9.4121094,3 9.1757812,3 H 6.8242188 C 6.5878906,3 6.3710938,3.1328125 6.265625,3.3457031 Z M 11.75,5.5 h -7.5 l 0.4140625,6.621094 C 4.6953125,12.615234 5.1054688,13 5.5996094,13 h 4.8007816 c 0.49414,0 0.904297,-0.384766 0.935547,-0.878906 z" style="display:inline;stroke-width:0.0195312"/><path d="m 14,1 a 1,1 0 0 1 1,1 v 12 a 1,1 0 0 1 -1,1 H 2 A 1,1 0 0 1 1,14 V 2 A 1,1 0 0 1 2,1 Z M 2,0 A 2,2 0 0 0 0,2 v 12 a 2,2 0 0 0 2,2 h 12 a 2,2 0 0 0 2,-2 V 2 A 2,2 0 0 0 14,0 Z" style="display:inline"/></svg>',
            tooltip: "Remove Link"
          }
        }
      }
    }
  },
  video: {
    selector: "iframe.ql-video",
    registerCustomVideoBlot: !1,
    registerBackspaceFix: !0,
    defaultAspectRatio: "16/9 auto",
    proxyStyle: {}
  }
}, tt = (h, t) => t;
class nt {
  Quill;
  quill;
  options;
  currentSpec;
  specs;
  overlay;
  toolbar;
  sizeInfo;
  actions;
  _startX = 0;
  // touch scroll tracking
  _startY = 0;
  _abortController;
  _resizeObserver;
  _tooltipContainPosition;
  ImageAlign;
  IframeAlign;
  constructor(t, e = {}) {
    this.Quill = t.constructor, this.quill = t, this.currentSpec = null, this.actions = [], e.debug && (window.blotFormatter = this);
    const i = j(this.Quill), s = D(this.Quill);
    if (this.ImageAlign = new i(e.debug), this.IframeAlign = new s(e.debug), e.debug && console.debug("Registering custom align formats", this.ImageAlign, this.IframeAlign), this.Quill.register({
      "formats/imageAlign": this.ImageAlign,
      "attributors/class/imageAlign": this.ImageAlign,
      "formats/iframeAlign": this.IframeAlign,
      "attributors/class/iframeAlign": this.IframeAlign
    }, !0), t.options.readOnly) {
      this.options = M, this.toolbar = new I(this), this.specs = [], this.overlay = document.createElement("div"), this.sizeInfo = document.createElement("div"), e.debug && console.debug("BlotFormatter disabled in read-only mode");
      return;
    }
    this.options = q(M, e, { arrayMerge: tt }), e.debug && console.debug("BlotFormatter options", this.options), [this.overlay, this.sizeInfo] = this._createOverlay(), this._addEventListeners(), this.toolbar = new I(this), e.debug && console.debug("BlotFormatter toolbar", this.toolbar), this.specs = this.options.specs.map(
      (o) => new o(this)
    ), this.specs.forEach((o) => o.init()), e.debug && console.debug("BlotFormatter specs", this.specs), this.quill.container.style.position = this.quill.container.style.position || "relative", this._registerCustomBlots(), this._keyboardBindings(), this.options.debug && console.debug("tooltip option", this.options.tooltip?.containTooltipPosition), this.options.tooltip?.containTooltipPosition && (this._tooltipContainPosition = new k(this.quill, this.options.debug));
  }
  /**
   * Destroys the BlotFormatter instance, cleaning up event listeners, actions, toolbar,
   * and DOM references. Also removes any global references and clears internal state.
   * Logs a debug message if the `debug` option is enabled.
   * Catches and logs any errors that occur during the destruction process.
   */
  destroy = () => {
    try {
      this.hide(), this._removeEventListeners(), this._destroyActions(), this.toolbar?.destroy(), this.overlay?.parentNode && this.overlay.parentNode.removeChild(this.overlay), this.currentSpec = null, this.specs = [], this.actions = [], this.options.tooltip?.containTooltipPosition && this._tooltipContainPosition && this._tooltipContainPosition?.destroy(), window.bf === this && delete window.bf, this.quill = null, this.options.debug && console.debug("BlotFormatter destroyed");
    } catch (t) {
      console.error("BlotFormatter.destroy error:", t);
    }
  };
  /**
   * Displays the blot formatter overlay for the specified blot.
   *
   * This method performs the following actions:
   * - Hides any open Quill tooltips (such as hyperlink dialogs).
   * - Optionally exposes the formatter instance for debugging.
   * - Clears any existing overlay if active on another blot.
   * - Sets the current blot specification and selection.
   * - Disables user selection to prevent unwanted interactions.
   * - Appends the overlay to the Quill editor container.
   * - Repositions the overlay to match the blot's position.
   * - Creates action buttons or controls for the current blot.
   * - Initializes the toolbar for the formatter.
   * - Adds a document-level pointerdown event listener to handle outside clicks.
   * - Logs debug information if enabled in options.
   *
   * @param spec - The specification of the blot (*BlotSpec*) to be formatted.
   * @returns void
   */
  show = (t) => {
    try {
      this.quill.container.querySelectorAll(".ql-tooltip:not(.ql-hidden)").forEach(
        (e) => {
          e.classList.add("ql-hidden");
        }
      ), this.options.debug && (window.blotFormatter = this), this.hide(), this.currentSpec = t, this.currentSpec.setSelection(), this._setUserSelect("none"), this.quill.container.appendChild(this.overlay), this._repositionOverlay(), this._createActions(t), this.toolbar.create(), this._scrollToolbarIntoView(this.toolbar.element), document.addEventListener("pointerdown", this._onDocumentPointerDown), this.options.debug && console.debug("BlotFormatter show", t);
    } catch (e) {
      throw console.error("Error showing BlotFormatter:", e), this.hide(), e;
    }
  };
  /**
   * Hides the blot formatter overlay and performs necessary cleanup.
   *
   * If a pointer event is provided, determines the click position relative to the target blot
   * and places the caret before or after the blot accordingly. Calls the `onHide` method of the
   * current spec, removes the overlay from the DOM, removes event listeners, resets user selection,
   * destroys toolbar and actions, and emits a `TEXT_CHANGE` event to ensure the editor state is updated.
   *
   * @param event - Optional pointer event that triggered the hide action. Used to determine caret placement.
   */
  hide = (t = null) => {
    if (this.currentSpec) {
      if (t) {
        const e = this.currentSpec.getTargetBlot();
        if (e) {
          const i = this._getClickPosition(t);
          i === "left" ? (this.options.debug && console.debug("Click position: LEFT"), _.placeCaretBeforeBlot(this.quill, e)) : i === "right" && (this.options.debug && console.debug("Click position: RIGHT"), _.placeCaretAfterBlot(this.quill, e));
        }
      }
      this.currentSpec.onHide(), this.currentSpec = null, this.quill.container.removeChild(this.overlay), document.removeEventListener("pointerdown", this._onDocumentPointerDown), this.overlay.style.setProperty("display", "none"), this._setUserSelect(""), this._destroyActions(), this.toolbar.destroy(), this.quill.emitter.emit(
        this.quill.constructor.events.TEXT_CHANGE,
        0,
        this.quill.getLength(),
        "api"
      );
    }
    this.options.debug && console.debug("BlotFormatter hide");
  };
  /**
   * Updates the state of the BlotFormatter overlay and its associated actions.
   *
   * This method repositions the overlay to match the current selection or formatting context,
   * triggers the `onUpdate` method for each registered action, and logs a debug message if
   * debugging is enabled in the options.
   *
   * @returns {void}
   */
  update = () => {
    this._repositionOverlay(), this.actions.forEach((t) => t.onUpdate()), this.options.debug && console.debug("BlotFormatter update");
  };
  /**
   * Initializes the actions for the given blot specification.
   * 
   * This method retrieves the list of actions from the provided `spec` using `getActions()`,
   * calls the `onCreate()` lifecycle method on each action, and assigns the resulting array
   * to the `actions` property. If debugging is enabled in the options, it logs each created action.
   *
   * @param spec - The blot specification containing the actions to initialize.
   */
  _createActions = (t) => {
    this.actions = t.getActions().map((e) => (e.onCreate(), this.options.debug && console.debug("BlotFormatter action created", e), e));
  };
  /**
   * Destroys all registered actions by calling their `onDestroy` method and clearing the actions array.
   * If debugging is enabled in the options, logs a debug message to the console.
   *
   * @private
   */
  _destroyActions = () => {
    this.actions.forEach((t) => t.onDestroy()), this.actions = [], this.options.debug && console.debug("BlotFormatter actions destroyed");
  };
  /**
   * Creates and configures the overlay and size info HTML elements used for formatting blots.
   *
   * The overlay element is styled and configured to be non-selectable, and the size info element
   * is appended to the overlay. Both elements can be customized via the `options.overlay` property.
   * 
   * @returns A tuple containing the overlay HTMLElement and the size info HTMLElement.
   */
  _createOverlay = () => {
    const t = document.createElement("div");
    t.classList.add(this.options.overlay.className), this.options.overlay.style && Object.assign(t.style, this.options.overlay.style), t.style.userSelect = "none", t.style.setProperty("-webkit-user-select", "none"), t.style.setProperty("-moz-user-select", "none"), t.style.setProperty("-ms-user-select", "none");
    const e = document.createElement("div");
    return this.options.overlay.sizeInfoStyle && Object.assign(e.style, this.options.overlay.sizeInfoStyle), t.appendChild(e), this.options.debug && console.debug("BlotFormatter overlay created", t, e), [t, e];
  };
  /**
   * Ensures that the toolbar element is visible within the viewport of the Quill editor.
   * If the toolbar is positioned above the visible area of the editor, it scrolls the target element into view
   * with an offset equal to the toolbar's height, then recalculates the toolbar's position.
   * If the toolbar is still above the viewport, it scrolls the window to bring the toolbar into view smoothly.
   *
   * @param toolbarElement - The HTML element representing the toolbar to be scrolled into view.
   * @returns A promise that resolves when any necessary scrolling has completed.
   */
  _scrollToolbarIntoView = async (t) => {
    let e = t.getBoundingClientRect();
    const i = this.quill.container.getBoundingClientRect(), s = this.currentSpec?.getTargetElement();
    e.top - i.top < 0 && s && (await this._scrollIntoViewWithOffset(s, e.height), e = t.getBoundingClientRect()), e.top < 0 && (this.options.debug && console.debug(`Scrolling window ${e.top - e.height}px to bring toolbar into view`), window.scrollBy({ top: e.top - e.height, behavior: "smooth" }));
  };
  /**
   * Scrolls the first scrollable ancestor of the given element into view with a specified offset.
   * If the element is outside the visible bounds of its scrollable ancestor, the ancestor is scrolled
   * so that the element is visible with the given offset from the top. Returns a promise that resolves
   * when scrolling has completed (or immediately if no scrolling was necessary).
   *
   * @param el - The target HTMLElement to scroll into view.
   * @param offset - The number of pixels to offset from the top of the scrollable ancestor (default: 10).
   * @returns A promise that resolves when scrolling is finished.
   */
  _scrollIntoViewWithOffset = (t, e = 10) => new Promise((i) => {
    let s = null;
    for (let o = t.parentElement; o; o = o.parentElement) {
      const { overflowY: n } = getComputedStyle(o);
      if (!["auto", "scroll"].includes(n) || o.scrollHeight <= o.clientHeight) continue;
      const r = o.getBoundingClientRect(), l = t.getBoundingClientRect();
      if (l.top < r.top + e) {
        s = o, o.scrollTo({
          top: o.scrollTop + l.top - r.top - e
        }), this.options.debug && console.debug(`Scrolling ancestor ${o.tagName} to bring element into view with offset ${e}px`);
        break;
      }
    }
    s ? setTimeout(() => {
      let n = s.scrollTop;
      const r = setInterval(() => {
        s.scrollTop === n ? (clearInterval(r), i()) : n = s.scrollTop;
      }, 50);
    }, 100) : i();
  });
  /**
   * Adds all necessary event listeners to the overlay and Quill root elements.
   *
   * - For the overlay:
   *   - Forwards mouse wheel and touch move events to allow scrolling.
   *   - Disables the context menu to prevent default browser actions.
   * - For the Quill root:
   *   - Repositions the overlay on scroll and resize events.
   *   - Dismisses the overlay when clicking on the Quill root.
   *
   * This method ensures proper interaction and synchronization between the overlay
   * and the Quill editor, handling user input and UI updates.
   *
   * @private
   */
  _addEventListeners = () => {
    this._abortController = new AbortController();
    const { signal: t } = this._abortController;
    this.overlay.addEventListener("wheel", this._passWheelEventThrough, { passive: !1, signal: t }), this.overlay.addEventListener("touchstart", this._onTouchScrollStart, { passive: !1, signal: t }), this.overlay.addEventListener("touchmove", this._onTouchScrollMove, { passive: !1, signal: t }), this.overlay.addEventListener("contextmenu", this._preventContextMenu, { signal: t }), this.quill.root.addEventListener("click", this._onClick, { signal: t }), this.quill.root.addEventListener("scroll", this._repositionOverlay, { signal: t }), this._resizeObserver = new ResizeObserver(this._repositionOverlay), this._resizeObserver.observe(this.quill.root);
  };
  /**
   * Removes event listeners and observers associated with the instance.
   * 
   * Aborts any ongoing operations managed by the internal AbortController,
   * and disconnects the internal ResizeObserver to stop observing changes.
   *
   * @private
   */
  _removeEventListeners = () => {
    this._abortController?.abort(), this._resizeObserver?.disconnect();
  };
  /**
   * Prevents the default context menu from appearing and stops the event from propagating further.
   *
   * @param event - The event object associated with the context menu action.
   */
  _preventContextMenu = (t) => {
    t.stopPropagation(), t.preventDefault();
  };
  /**
   * Repositions the overlay element to align with the currently selected blot's overlay target.
   *
   * Calculates the position and size of the overlay based on the bounding rectangles of the
   * Quill container and the overlay target element. Updates the overlay's style to match
   * the target's position and dimensions, ensuring it is correctly displayed over the selected blot.
   * Optionally logs debug information if the `debug` option is enabled.
   *
   * @private
   */
  _repositionOverlay = () => {
    if (this.currentSpec) {
      const t = this.currentSpec.getOverlayElement();
      if (t) {
        const e = this.quill.container.getBoundingClientRect(), i = t.getBoundingClientRect(), s = {
          left: `${i.left - e.left - 1 + this.quill.container.scrollLeft}px`,
          top: `${i.top - e.top + this.quill.container.scrollTop}px`,
          width: `${i.width}px`,
          height: `${i.height}px`
        };
        Object.assign(this.overlay.style, {
          display: "block",
          ...s
        }), this.options.debug && console.debug("Blotformatter _repositionOverlay", "specRect:", i, "overlayRect:", s);
      }
    }
  };
  /**
   * Sets the CSS `user-select` property (and its vendor-prefixed variants) to the specified value
   * on both the Quill editor root element and the document's root element.
   *
   * This method is typically used to enable or disable text selection within the editor and the page,
   * which can be useful during formatting operations to prevent unwanted user interactions.
   *
   * @param value - The value to set for the `user-select` property (e.g., `'none'`, `'auto'`).
   */
  _setUserSelect = (t) => {
    [
      "userSelect",
      "mozUserSelect",
      "webkitUserSelect",
      "msUserSelect"
    ].forEach((i) => {
      this.quill.root.style.setProperty(i, t), document.documentElement && document.documentElement.style.setProperty(i, t);
    }), this.options.debug && console.debug("BlotFormatter _setUserSelect", t);
  };
  /**
   * Handles the `pointerdown` event on the document to determine whether the blot formatter overlay should be dismissed.
   *
   * If the pointer event target is outside the Quill editor, not within a blot formatter modal,
   * and not a proxy image used by the blot formatter, the overlay is hidden.
   *
   * @param event - The pointer event triggered by user interaction.
   */
  _onDocumentPointerDown = (t) => {
    const e = t.target;
    this.quill.root.parentNode.contains(e) || e.closest("[data-blot-formatter-modal]") || e.classList.contains("blot-formatter__proxy-image") || this.hide(t);
  };
  /**
   * Handles pointer click events on the editor.
   * 
   * If debugging is enabled in the options, logs the click event to the console.
   * Then, hides the formatter UI in response to the click event.
   *
   * @param event - The pointer event triggered by the user's click.
   */
  _onClick = (t) => {
    this.options.debug && console.debug("BlotFormatter _onClick", t), this.hide(t);
  };
  /**
   * Handles the wheel event by scrolling the Quill editor's root element.
   * This method is intended to be used when the overlay or proxy receives a wheel event,
   * ensuring that the scroll action is passed through to the underlying Quill editor.
   *
   * @param event - The wheel event containing scroll delta values.
   *
   * @remarks
   * If the `debug` option is enabled, this method logs the scroll delta values to the console.
   */
  _passWheelEventThrough = (t) => {
    this.quill.root.scrollLeft += t.deltaX, this.quill.root.scrollTop += t.deltaY, this.options.debug && console.debug(`BlotFormatter scrolling Quill root x: ${t.deltaX}, y: ${t.deltaY}`);
  };
  /**
   * Handles the touch start event for scrolling interactions.
   * Records the initial X and Y positions of the first touch point.
   * Optionally logs debug information if enabled in options.
   *
   * @param event - The touch event triggered when the user starts touching the screen.
   */
  _onTouchScrollStart = (t) => {
    if (t.touches.length === 1) {
      const e = t.touches[0];
      this._startX = e.clientX, this._startY = e.clientY, this.options.debug && console.debug("BlotFormatter _onTouchScrollStart", `X: ${this._startX}, Y: ${this._startY}`);
    }
  };
  /**
   * Handles touch move events to enable custom scrolling behavior within the Quill editor root element.
   * 
   * This method allows for both vertical and horizontal scrolling using touch gestures,
   * and prevents default browser scrolling when appropriate to provide a smoother, controlled experience.
   * It updates the scroll position of the editor root based on the movement of the touch point,
   * and ensures scrolling does not exceed the bounds of the content.
   * 
   * @param event - The touch event triggered by the user's finger movement.
   * 
   * @remarks
   * - Only processes single-touch events.
   * - Prevents default scrolling if the editor can be scrolled further in the direction of the gesture.
   * - Updates the starting touch coordinates after each move to track incremental movement.
   * - Logs debug information if the `debug` option is enabled.
   */
  _onTouchScrollMove = (t) => {
    if (t.touches.length === 1) {
      const e = t.touches[0], i = this._startX - e.clientX, s = this._startY - e.clientY;
      if (Math.abs(i) < 2 && Math.abs(s) < 2) return;
      const o = this.quill.root, n = o.scrollTop === 0, r = o.scrollTop + o.clientHeight === o.scrollHeight, l = o.scrollLeft === 0, p = o.scrollLeft + o.clientWidth === o.scrollWidth, m = Math.abs(s) > Math.abs(i), u = Math.abs(i) > Math.abs(s);
      let g = !1;
      m && !(n && s < 0) && !(r && s > 0) && (g = !0, o.scrollTop += s), u && !(l && i < 0) && !(p && i > 0) && (g = !0, o.scrollLeft += i), g && t.preventDefault(), this._startX = e.clientX, this._startY = e.clientY, this.options.debug && console.debug("BlotFormatter touch scroll end", `X: ${this._startX}, Y: ${this._startY}`);
    }
  };
  /**
   * Registers custom Quill blots based on the provided options.
   *
   * - If `options.image.registerImageTitleBlot` is enabled, registers a custom Image blot
   *   that supports a title attribute.
   * - If `options.video.registerCustomVideoBlot` is enabled, registers a custom Video blot
   *   with responsive behavior and sets its default aspect ratio from the options.
   *
   * Debug information is logged to the console if `options.debug` is true.
   *
   * @private
   */
  _registerCustomBlots = () => {
    if (this.options.image.registerImageTitleBlot) {
      const t = W(this.Quill);
      this.options.debug && console.debug("Registering custom Image blot", t), this.Quill.register({ "formats/image": t }, !0), this.options.debug && console.debug("formats/image after register:", this.Quill.import("formats/image"));
    }
    if (this.options.video.registerCustomVideoBlot) {
      const t = P(this.Quill);
      this.options.debug && (console.debug("Registering custom Video blot", t), console.debug("Setting default aspect ratio for Video blot", this.options.video.defaultAspectRatio)), t.aspectRatio = this.options.video.defaultAspectRatio, this.Quill.register({ "formats/video": t }, !0), this.options.debug && console.debug("formats/video after register:", this.Quill.import("formats/video"));
    }
  };
  /**
   * Registers custom keyboard bindings to address specific Quill editor issues and enhance user experience.
   *
   * - Adds a Backspace key binding to fix Quill bug #4364, ensuring proper deletion behavior for embedded videos (e.g., iframes).
   *   This is enabled if `options.video.registerBackspaceFix` is true.
   * - Adds an ArrowRight key binding to fix cursor navigation issues when moving past images,
   *   ensuring the cursor does not get stuck or hidden at the image location.
   *   This is enabled if `options.image.registerArrowRightFix` is true.
   *
   * Both bindings are conditionally registered based on the provided options.
   * Debug information is logged to the console if `options.debug` is enabled.
   *
   * @private
   */
  _keyboardBindings = () => {
    if (this.options.video.registerBackspaceFix) {
      this.quill.keyboard.bindings.Backspace || (this.quill.keyboard.bindings.Backspace = []);
      const t = {
        key: "Backspace",
        empty: !0,
        line: {
          domNode: {
            tagName: "IFRAME"
          }
        },
        handler: (e) => {
          this.quill.deleteText(e.index - 1, 1, "user");
        }
      };
      this.quill.keyboard.bindings.Backspace.unshift(t), this.options.debug && console.debug("BlotFormatter added Backspace keyboard binding", t);
    }
    if (this.options.image.registerArrowRightFix) {
      this.quill.keyboard.bindings.ArrowRight || (this.quill.keyboard.bindings.ArrowRight = []);
      const t = {
        key: "ArrowRight",
        collapsed: !0,
        empty: !1,
        suffix: /^$/,
        line: {
          domNode: {
            tagName: "P"
          }
        },
        handler: (e, i) => {
          const s = e.index + e.length, o = this.quill.getLength();
          s + 1 >= o - 1 ? this.quill.setSelection(o - 1, 0, "user") : (this.quill.setSelection(s + 2, 0, "user"), _.sendCaretBack(1));
        }
      };
      this.quill.keyboard.bindings.ArrowRight.unshift(t), this.options.debug && console.debug("BlotFormatter added ArrowRightFix keyboard binding", t);
    }
  };
  /**
   * Determines whether the resizing of the target element should use relative sizing (percentages)
   * or absolute sizing (pixels), based on the current configuration and the element's width attribute.
   *
   * @param targetElement - The HTML element whose sizing mode is being determined.
   * @returns `true` if relative sizing should be used, `false` otherwise.
   *
   * The method checks the `useRelativeSize` option and, if `allowResizeModeChange` is enabled,
   * inspects the element's `width` attribute to decide whether to use relative or absolute sizing.
   * If debugging is enabled, logs the decision to the console.
   */
  _useRelative = (t) => {
    let e = this.options.resize.useRelativeSize;
    if (this.options.resize.allowResizeModeChange) {
      const i = t.getAttribute("width");
      i ? e = i.endsWith("%") : e = this.options.resize.useRelativeSize;
    }
    return this.options.debug && console.debug("BlotFormatter _useRelative", e, "for element", t), e;
  };
  /**
   * Determines the relative position of a pointer event with respect to the overlay element.
   *
   * @param event - The pointer event to evaluate.
   * @returns The position of the pointer relative to the overlay, as a `PointerPosition` enum value.
   *
   * The possible return values are:
   * - `PointerPosition.ABOVE` if the pointer is above the overlay.
   * - `PointerPosition.BELOW` if the pointer is below the overlay.
   * - `PointerPosition.LEFT` if the pointer is to the left of the overlay.
   * - `PointerPosition.RIGHT` if the pointer is to the right of the overlay.
   * - `PointerPosition.INSIDE` if the pointer is inside the overlay.
   *
   * If the `debug` option is enabled, logs the determined position and event to the console.
   */
  _getClickPosition = (t) => {
    const i = this.overlay.getBoundingClientRect();
    let s;
    return t.clientY < i.top ? s = "above" : t.clientY > i.bottom ? s = "below" : t.clientX < i.left ? s = "left" : t.clientX > i.right ? s = "right" : s = "inside", this.options.debug && console.debug("BlotFormatter _getClickPosition", s, "for event", t), s;
  };
}
export {
  v as Action,
  F as AlignAction,
  Q as AttributeAction,
  z as BlotSpec,
  _ as CaretAction,
  $ as DefaultAligner,
  M as DefaultOptions,
  U as DeleteAction,
  K as IframeVideoSpec,
  G as ImageSpec,
  Z as LinkAction,
  V as ResizeAction,
  I as Toolbar,
  A as ToolbarButton,
  k as TooltipContainPosition,
  Y as UnclickableBlotSpec,
  W as createAltTitleImageBlotClass,
  D as createIframeAlignAttributor,
  j as createImageAlignAttributor,
  P as createResponsiveVideoBlotClass,
  nt as default
};
//# sourceMappingURL=index.esm.js.map
