import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["dialog", "message"];
  static values = { message: String };

  connect() {
    this._allowed = false;
    this._source = null;
  }

  intercept(event) {
    if (this._allowed) {
      this._allowed = false;
      return;
    }

    event.preventDefault();
    this._source = event.target;

    if (this.hasMessageTarget && this.messageValue) {
      this.messageTarget.textContent = this.messageValue;
    }

    this._open();
  }

  proceed() {
    this._close();

    const source = this._source;
    this._source = null;
    if (!source) return;

    this._allowed = true;
    if (typeof source.requestSubmit === "function") {
      source.requestSubmit();
    } else {
      source.click();
    }
  }

  cancel() {
    this._close();
    this._source = null;
  }

  _open() {
    if (this.dialogTarget.open) return;
    if (typeof this.dialogTarget.showModal === "function") {
      this.dialogTarget.showModal();
    } else {
      this.dialogTarget.setAttribute("open", "");
    }
  }

  _close() {
    if (typeof this.dialogTarget.close === "function") {
      this.dialogTarget.close();
    } else {
      this.dialogTarget.removeAttribute("open");
    }
  }
}
