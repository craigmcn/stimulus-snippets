import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["checkbox", "error"];
  static values = { min: { type: Number, default: 1 } };

  connect() {
    this._form = this.element.closest("form");
    if (this._form) {
      this._submitHandler = (event) => this.validate(event);
      this._form.addEventListener("submit", this._submitHandler);
    }
    this.validate();
  }

  disconnect() {
    if (this._form) {
      this._form.removeEventListener("submit", this._submitHandler);
    }
  }

  validate(event) {
    const valid =
      this.checkboxTargets.filter((cb) => cb.checked).length >= this.minValue;

    this.element.dataset.valid = valid;

    if (this.hasErrorTarget) {
      this.errorTarget.hidden = valid;
    }

    if (!valid && event?.type === "submit") {
      event.preventDefault();
    }
  }
}
