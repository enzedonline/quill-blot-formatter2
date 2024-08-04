import Quill from 'quill';
import deepmerge from 'deepmerge';
import DefaultOptions, { Options } from './Options';
import Action from './actions/Action';
import BlotSpec from './specs/BlotSpec';
import Image from './blots/Image';

const dontMerge = (destination: Array<any>, source: Array<any>) => source;

export default class BlotFormatter {
  quill: any;
  options: Options;
  currentSpec: BlotSpec | null;
  specs: BlotSpec[];
  overlay: HTMLElement;
  actions: Action[];

  constructor(quill: any, options: Partial<Options> = {}) {
    this.quill = quill;
    this.options = deepmerge(DefaultOptions, options, { arrayMerge: dontMerge });
    this.currentSpec = null;
    this.actions = [];
    this.overlay = document.createElement('div');
    this.overlay.classList.add(this.options.overlay.className);
    if (this.options.overlay.style) {
      Object.assign(this.overlay.style, this.options.overlay.style);
    }

    // disable native image resizing on firefox
    document.execCommand('enableObjectResizing', false, 'false'); // eslint-disable-line no-undef
    this.quill.root.parentNode.style.position = this.quill.root.parentNode.style.position || 'relative';

    this.quill.root.addEventListener('click', this.onClick);
    this.specs = this.options.specs.map((SpecClass: new (formatter: BlotFormatter) => BlotSpec) => new SpecClass(this));
    this.specs.forEach(spec => spec.init());

    // register image bot with title attribute support
    if (this.options.image.registerImageTitleBlot) {
      Quill.register(Image, true);
    }
  }

  show(spec: BlotSpec) {
    this.currentSpec = spec;
    this.currentSpec.setSelection();
    this.setUserSelect('none');
    this.quill.root.parentNode.appendChild(this.overlay);
    this.repositionOverlay();
    this.createActions(spec);
    document.addEventListener('click', this.onDocumentClick);
  }

  hide() {
    if (!this.currentSpec) {
      return;
    }

    this.currentSpec.onHide();
    this.currentSpec = null;
    this.quill.root.parentNode.removeChild(this.overlay);
    document.removeEventListener('click', this.onDocumentClick);
    this.overlay.style.setProperty('display', 'none');
    this.setUserSelect('');
    this.destroyActions();
    // TEXT_CHANGE event clears resize cursor from image when form is saved while overlay still active
    this.quill.emitter.emit(
      this.quill.constructor.events.TEXT_CHANGE, 0, this.quill.getLength(), 'api'
    );
  }

  update() {
    this.repositionOverlay();
    this.actions.forEach(action => action.onUpdate());
  }

  createActions(spec: BlotSpec) {
    this.actions = spec.getActions().map((action: Action) => {
      action.onCreate();
      return action;
    });
  }

  destroyActions() {
    this.actions.forEach((action: Action) => action.onDestroy());
    this.actions = [];
  }

  repositionOverlay() {
    if (!this.currentSpec) {
      return;
    }

    const overlayTarget = this.currentSpec.getOverlayElement();
    if (!overlayTarget) {
      return;
    }

    const parent: HTMLElement = this.quill.root.parentNode;
    const specRect = overlayTarget.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    Object.assign(this.overlay.style, {
      display: 'block',
      left: `${specRect.left - parentRect.left - 1 + parent.scrollLeft}px`,
      top: `${specRect.top - parentRect.top + parent.scrollTop}px`,
      width: `${specRect.width}px`,
      height: `${specRect.height}px`,
    });
  }

  setUserSelect(value: string) {
    const props: string[] = [
      'userSelect',
      'mozUserSelect',
      'webkitUserSelect',
      'msUserSelect',
    ];

    props.forEach((prop: string) => {
      // set on contenteditable element and <html>
      this.quill.root.style.setProperty(prop, value);
      if (document.documentElement) {
        document.documentElement.style.setProperty(prop, value);
      }
    });
  }

  onDocumentClick = (event: MouseEvent) => {
    // if clicked outside of quill editor and not the alt/title modal or iframe proxy image, dismiss overlay 
    const target = event.target as HTMLElement;
    if (!(
      this.quill.root.parentNode.contains(target) || 
      target.closest('div[data-blot-formatter-modal]') || 
      target.classList.contains('blot-formatter__proxy-image')
    )) {
      this.hide();
    }
  }

  onClick = () => {
    this.hide();
  }
}
