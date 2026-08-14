import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["field"];

  connect() {
    this._sync = this._sync.bind(this);
    window.addEventListener("resize", this._sync);
    this._sync();
  }

  disconnect() {
    window.removeEventListener("resize", this._sync);
  }

  _sync() {
    const field = this.hasFieldTarget ? this.fieldTarget : this.element;
    field.disabled = this._isHidden(field);
  }

  _isHidden(el) {
    while (el && el !== document.body) {
      if (getComputedStyle(el).display === "none") return true;
      el = el.parentElement;
    }
    return false;
  }
}
