import Quill from 'quill';
import { Toolbar } from './Toolbar';
import { Aligner } from './Aligner';
import type { Alignment } from './Alignment';
import BlotFormatter from '../../BlotFormatter';
import type { Blot } from '../../specs/BlotSpec';
import AttributeAction from '../AttributeAction';

export default class DefaultToolbar implements Toolbar {
  toolbar: HTMLElement | null;
  buttons: HTMLElement[];

  constructor() {
    this.toolbar = null;
    this.buttons = [];
  }

  create(formatter: BlotFormatter, aligner: Aligner): HTMLElement {
    const toolbar = document.createElement('div');
    toolbar.classList.add(formatter.options.align.toolbar.mainClassName);
    this.addToolbarStyle(formatter, toolbar);
    this.addButtons(formatter, toolbar, aligner);

    this.toolbar = toolbar;
    return this.toolbar;
  }

  destroy() {
    this.toolbar = null;
    this.buttons = [];
  }

  getElement() {
    return this.toolbar;
  }

  addToolbarStyle(formatter: BlotFormatter, toolbar: HTMLElement) {
    if (formatter.options.align.toolbar.mainStyle) {
      Object.assign(toolbar.style, formatter.options.align.toolbar.mainStyle);
    }
  }

  addButtonStyle(button: HTMLElement, index: number, formatter: BlotFormatter) {
    if (formatter.options.align.toolbar.buttonStyle) {
      Object.assign(button.style, formatter.options.align.toolbar.buttonStyle);
      if (index > 0) {
        button.style.borderLeftWidth = '0'; // eslint-disable-line no-param-reassign
      }
    }

    if (formatter.options.align.toolbar.svgStyle) {
      const childElement = button.children[0] as HTMLElement; // Type assertion
      if (childElement) {
        Object.assign(childElement.style, formatter.options.align.toolbar.svgStyle);
      }
    }
  }

  addButtons(formatter: BlotFormatter, toolbar: HTMLElement, aligner: Aligner) {
    let align_counter: number = 0;
    aligner.getAlignments().forEach((alignment, i) => {
      const button = document.createElement('span');
      button.classList.add(formatter.options.align.toolbar.buttonClassName);
      button.innerHTML = alignment.icon;
      button.addEventListener('click', () => {
        this.onButtonClick(button, formatter, alignment, aligner);
      });
      this.preselectButton(button, alignment, formatter, aligner);
      this.addButtonStyle(button, i, formatter);
      this.buttons.push(button);
      toolbar.appendChild(button);
      align_counter = i;
    });
    // Add alt/title button if target is image
    const targetElement = formatter.currentSpec?.getTargetElement();
    if (targetElement?.tagName === "IMG") {
      const attributeAction = new AttributeAction(formatter);
      const button = document.createElement('span');
      button.classList.add(formatter.options.align.toolbar.buttonClassName);
      button.innerHTML = attributeAction.icon;
      button.addEventListener('click', (event) => {
        attributeAction.showAltTitleModal(event);
      });
      this.addButtonStyle(button, ++align_counter, formatter);
      this.buttons.push(button);
      toolbar.appendChild(button);
    }
  }

  preselectButton(
    button: HTMLElement,
    alignment: Alignment,
    formatter: BlotFormatter,
    aligner: Aligner,
  ) {
    if (!formatter.currentSpec) {
      return;
    }

    const target = formatter.currentSpec.getTargetElement();
    if (!target) {
      return;
    }

    const blot = Quill.find(target) as Blot | null;
    if (aligner.isAligned(blot, alignment)) {
      this.selectButton(formatter, button);
    }
  }

  onButtonClick(
    button: HTMLElement,
    formatter: BlotFormatter,
    alignment: Alignment,
    aligner: Aligner,
  ) {
    if (!formatter.currentSpec) {
      return;
    }

    const target = formatter.currentSpec.getTargetElement();
    if (!target) {
      return;
    }

    this.clickButton(button, target, formatter, alignment, aligner);
  }

  clickButton(
    button: HTMLElement,
    alignTarget: HTMLElement,
    formatter: BlotFormatter,
    alignment: Alignment,
    aligner: Aligner,
  ) {
    this.buttons.forEach((b) => { this.deselectButton(formatter, b); });
    const blot = Quill.find(alignTarget) as Blot | null;
    if (aligner.isAligned(blot, alignment)) {
      if (formatter.options.align.toolbar.allowDeselect) {
        aligner.clear(blot);
      } else {
        this.selectButton(formatter, button);
      }
    } else {
      this.selectButton(formatter, button);
      alignment.apply(blot);
    }

    formatter.update();
  }

  selectButton(formatter: BlotFormatter, button: HTMLElement) {
    button.classList.add('is-selected');
    if (formatter.options.align.toolbar.addButtonSelectStyle) {
      button.style.setProperty('filter', 'invert(20%)');
    }
  }

  deselectButton(formatter: BlotFormatter, button: HTMLElement) {
    button.classList.remove('is-selected');
    if (formatter.options.align.toolbar.addButtonSelectStyle) {
      button.style.removeProperty('filter');
    }
  }
}
