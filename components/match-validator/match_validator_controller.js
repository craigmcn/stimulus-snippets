import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["field", "match", "error"];
  static values = { caseSensitive: { type: Boolean, default: true } };

  connect() {
    this._form = this.element.closest("form");
    if (this._form) {
      this._submitHandler = (event) => this.validate(event);
      this._form.addEventListener("submit", this._submitHandler);
    } else {
      console.warn(
        "[match-validator] controller element is not inside a <form>; submit validation will not work.",
      );
    }
    this._initValid();
  }

  disconnect() {
    if (this._form) {
      this._form.removeEventListener("submit", this._submitHandler);
    }
  }

  validate(event) {
    const valid = this._matches();

    this.element.dataset.valid = valid;

    if (this.hasErrorTarget) {
      this.errorTarget.hidden = valid;
    }

    if (this.hasMatchTarget) {
      this.matchTarget.setAttribute("aria-invalid", !valid);
    }

    if (!valid && event?.type === "submit") {
      event.preventDefault();
    }
  }

  _initValid() {
    this.element.dataset.valid = this._matches();
  }

  _matches() {
    if (!this.hasFieldTarget || !this.hasMatchTarget) return true;

    let fieldValue = this.fieldTarget.value;
    let matchValue = this.matchTarget.value;

    if (!this.caseSensitiveValue) {
      fieldValue = fieldValue.toLowerCase();
      matchValue = matchValue.toLowerCase();
    }

    return fieldValue === matchValue;
  }
}
