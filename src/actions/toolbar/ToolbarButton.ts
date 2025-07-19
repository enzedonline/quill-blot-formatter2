import { ToolbarOptions } from "../../Options";

export interface _ToolbarButton {
    action: string;
    element: HTMLElement | null;
    icon: string;
    selected: boolean;
    visible: boolean;
    onClick: EventListener;
    options: ToolbarOptions;
    create(action: string, icon: string): HTMLElement;
}

export default class ToolbarButton implements _ToolbarButton {
    action: string;
    icon: string;
    onClick: EventListener;
    options: ToolbarOptions;
    element: HTMLElement | null = null;
    initialVisibility: boolean = true; // preset visibility before button is created

    constructor(
        action: string,
        onClickHandler: EventListener,
        options: ToolbarOptions
    ) {
        this.action = action;
        this.icon = options.icons[action as keyof typeof options.icons];
        this.onClick = onClickHandler;
        this.options = options;
    }

    create(): HTMLElement {
        this.element = document.createElement('span');
        this.element.innerHTML = this.icon;
        this.element.className = this.options.buttonClassName;
        this.element.dataset.action = this.action;
        this.element.onclick = this.onClick;
        if (this.options.tooltips && this.options.tooltips[this.action]) {
            this.element.title = this.options.tooltips[this.action];
        }
        this.selected = this.preselect();
        this.visible = this.initialVisibility;
        this.styleButton();
        return this.element;
    }

    destroy(): void {
        if (this.element) {
            this.element.onclick = null;
            this.element.remove();
            this.element = null;
        }
    }

    preselect(): boolean {
        // override this with logic to show if button is selected (active) when loaded
        // someCriteria: boolean = true / false;
        // return someCriteria;
        return false;
    }

    get selected(): boolean {
        return this.element?.dataset.selected === 'true';
    }

    set selected(value: boolean) {
        if (this.element) {
            this.element.dataset.selected = value.toString();
            // apply styles to indicate selected state
            if (value) {
                this.element.classList.add(this.options.buttonSelectedClassName);
                if (this.options.buttonSelectedStyle) {
                    Object.assign(this.element.style, this.options.buttonSelectedStyle);
                }
            } else {
                this.element.classList.remove(this.options.buttonSelectedClassName);
                if (this.options.buttonSelectedStyle) {
                    this.element.removeAttribute('style');
                    if (this.options.buttonStyle)
                        Object.assign(this.element.style, this.options.buttonStyle);
                }
            }
        }
    }

    get visible(): boolean {
        return this.element?.style.display !== 'none';
    }

    set visible(style: string | boolean) {
        if (this.element) {
            if (typeof style === 'boolean') {
                style = style ? 'inline-block' : 'none';
            }
            this.element.style.display = style
        }
    }

    private styleButton() {
        if (this.element) {
            if (this.options.buttonStyle) {
                Object.assign(this.element.style, this.options.buttonStyle);
            }
            if (this.options.svgStyle) {
                const childElement = this.element.children[0] as HTMLElement; // Type assertion
                if (childElement) {
                    Object.assign(childElement.style, this.options.svgStyle);
                }
            }
        }
    }

}