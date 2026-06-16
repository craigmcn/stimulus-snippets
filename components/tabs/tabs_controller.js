import { Controller } from "@hotwired/stimulus";

let uid = 0;

export default class extends Controller {
  static targets = ["tab", "panel"];
  static values = { index: { type: Number, default: 0 } };

  connect() {
    if (!this.element.id) this.element.id = `tabs-${++uid}`;

    this.tabTargets.forEach((tab, i) => {
      tab.setAttribute("role", "tab");
      if (!tab.id) tab.id = `${this.element.id}-tab-${i}`;
    });

    this.panelTargets.forEach((panel, i) => {
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("tabindex", "0");
      if (!panel.id) panel.id = `${this.element.id}-panel-${i}`;
      const tab = this.tabTargets[i];
      if (tab) {
        tab.setAttribute("aria-controls", panel.id);
        panel.setAttribute("aria-labelledby", tab.id);
      }
    });

    this._activate(this.indexValue);
  }

  // Handles programmatic changes: controller.indexValue = 2
  indexValueChanged(index) {
    if (this._activated) this._activate(index);
  }

  select({ currentTarget }) {
    const index = this.tabTargets.indexOf(currentTarget);
    if (index !== -1) {
      this.indexValue = index;
      this._activate(index);
    }
  }

  keydown(event) {
    const tabs = this.tabTargets;
    const current = tabs.indexOf(event.currentTarget);
    const count = tabs.length;
    let next;

    switch (event.key) {
      case "ArrowRight":
        next = (current + 1) % count;
        break;
      case "ArrowLeft":
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
    this.indexValue = next;
    this._activate(next);
    tabs[next].focus();
  }

  _activate(index) {
    this._activated = true;
    this.tabTargets.forEach((tab, i) => {
      tab.setAttribute("aria-selected", i === index ? "true" : "false");
      tab.setAttribute("tabindex", i === index ? "0" : "-1");
    });
    this.panelTargets.forEach((panel, i) => {
      panel.hidden = i !== index;
    });
  }
}
