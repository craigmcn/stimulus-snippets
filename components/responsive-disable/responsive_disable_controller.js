import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["field"];
  static values = { delay: { type: Number, default: 150 } };

  connect() {
    const field = this.hasFieldTarget ? this.fieldTarget : this.element;

    if (!("disabled" in field)) {
      console.warn(
        '[responsive-disable] resolved field does not support the disabled attribute; add a data-responsive-disable-target="field" to the actual form control.',
      );
      return;
    }

    this._field = field;
    this._onResize = this._onResize.bind(this);
    this._onInput = this._onInput.bind(this);
    window.addEventListener("resize", this._onResize);
    field.addEventListener("input", this._onInput);
    this._applySync();
  }

  disconnect() {
    window.removeEventListener("resize", this._onResize);
    clearTimeout(this._resizeTimer);
    this._field?.removeEventListener("input", this._onInput);
  }

  _onResize() {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => this._applySync(), this.delayValue);
  }

  _applySync() {
    const field = this.hasFieldTarget ? this.fieldTarget : this.element;
    field.disabled = this._isHidden(field);
  }

  _onInput(event) {
    const field = event.currentTarget;

    if (!field.name) return;

    const scope = field.form || document;
    scope.querySelectorAll("[name]").forEach((other) => {
      if (other !== field && other.name === field.name) {
        other.value = field.value;
      }
    });
  }

  _isHidden(el) {
    while (el) {
      if (getComputedStyle(el).display === "none") return true;
      if (el === this.element) break;
      el = el.parentElement;
    }
    return false;
  }
}
