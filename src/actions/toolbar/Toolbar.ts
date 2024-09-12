import BlotFormatter from "../../BlotFormatter";
import ToolbarButton from "./ToolbarButton";

export default class Toolbar {
    formatter: BlotFormatter;
    element: HTMLElement;
    buttons: Record<string, ToolbarButton> = {};

    constructor(formatter: BlotFormatter) {
        this.formatter = formatter;
        this.element = document.createElement('div');
        this.element.classList.add(this.formatter.options.toolbar.mainClassName);
        this.element.addEventListener('mousedown', (event: MouseEvent) => {
            event.stopPropagation();
        });
        if (this.formatter.options.toolbar.mainStyle) {
            Object.assign(this.element.style, this.formatter.options.toolbar.mainStyle);
        }
    }

    create(): void {
        const actionButtons: HTMLElement[] = [];
        this.formatter.actions.forEach(action => {
            action.toolbarButtons.forEach(button => {
                this.buttons[button.action] = button;
                actionButtons.push(button.create());
            });
        });
        this.element.append(...actionButtons);
        this.formatter.overlay.append(this.element);
    }

    destroy(): void {
        if (this.element) {
            this.formatter.overlay.removeChild(this.element);
        }
        for (const button of Object.values(this.buttons)) {
            button.destroy();
        }
        this.buttons = {};
        this.element.innerHTML = '';
    }
}