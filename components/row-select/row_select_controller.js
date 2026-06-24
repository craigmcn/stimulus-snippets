import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["all", "row", "bar", "count"];

  connect() {
    if (this.hasCountTarget && !this.countTarget.hasAttribute("aria-live")) {
      this.countTarget.setAttribute("aria-live", "polite");
    }
    this._lastIndex = null;
    this._refresh();
  }

  toggleAll() {
    const checked = this.allTarget.checked;
    this.rowTargets.forEach((row) => {
      row.checked = checked;
    });
    this._lastIndex = null;
    this._refresh();
  }

  toggle(event) {
    const checkbox = event.target;
    const index = this.rowTargets.indexOf(checkbox);

    if (event.shiftKey && this._lastIndex !== null && index !== -1) {
      const [start, end] = [this._lastIndex, index].sort((a, b) => a - b);
      for (let i = start; i <= end; i++) {
        this.rowTargets[i].checked = checkbox.checked;
      }
    }

    this._lastIndex = index;
    this._refresh();
  }

  _refresh() {
    const total = this.rowTargets.length;
    const checked = this.rowTargets.filter((row) => row.checked).length;

    if (this.hasAllTarget) {
      this.allTarget.checked = total > 0 && checked === total;
      this.allTarget.indeterminate = checked > 0 && checked < total;
    }

    if (this.hasBarTarget) this.barTarget.hidden = checked === 0;
    if (this.hasCountTarget) this.countTarget.textContent = String(checked);

    this.rowTargets.forEach((row) => {
      row
        .closest("tr")
        ?.toggleAttribute("data-row-select-selected", row.checked);
    });
  }
}
