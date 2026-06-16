import { Controller } from "@hotwired/stimulus";

let uid = 0;

export default class extends Controller {
  static targets = ["trigger", "panel"];
  static values = { exclusive: { type: Boolean, default: false } };

  connect() {
    if (!this.element.id) {
      let id;
      do {
        id = `accordion-${++uid}`;
      } while (document.getElementById(id));
      this.element.id = id;
    }

    this.triggerTargets.forEach((trigger, i) => {
      if (!trigger.id) trigger.id = `${this.element.id}-trigger-${i}`;
    });

    this.panelTargets.forEach((panel, i) => {
      if (!panel.id) panel.id = `${this.element.id}-panel-${i}`;
      const trigger = this.triggerTargets[i];
      if (trigger) {
        trigger.setAttribute("aria-controls", panel.id);
        panel.setAttribute("aria-labelledby", trigger.id);
        trigger.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
      }
    });

    if (this.exclusiveValue) {
      const firstOpen = this.panelTargets.findIndex((p) => !p.hidden);
      this.panelTargets.forEach((_, i) => {
        if (i !== firstOpen && !this.panelTargets[i].hidden)
          this._closePanel(i);
      });
    }
  }

  toggle({ currentTarget }) {
    const index = this.triggerTargets.indexOf(currentTarget);
    if (index === -1) return;
    const panel = this.panelTargets[index];
    if (!panel) return;

    const opening = panel.hidden;

    if (opening && this.exclusiveValue) {
      this.panelTargets.forEach((p, i) => {
        if (i !== index && !p.hidden) this._closePanel(i);
      });
    }

    panel.hidden = !opening;
    currentTarget.setAttribute("aria-expanded", opening ? "true" : "false");
  }

  keydown(event) {
    const triggers = this.triggerTargets;
    const current = triggers.indexOf(event.currentTarget);
    if (current === -1) return;
    const count = triggers.length;
    let next;

    switch (event.key) {
      case "ArrowDown":
        next = (current + 1) % count;
        break;
      case "ArrowUp":
        next = (current - 1 + count) % count;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    triggers[next].focus();
  }

  _closePanel(index) {
    const panel = this.panelTargets[index];
    const trigger = this.triggerTargets[index];
    if (panel) panel.hidden = true;
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }
}
