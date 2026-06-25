import { Controller } from "@hotwired/stimulus";

const DEFAULT_MESSAGE = "You have unsaved changes. Leave this page?";

export default class extends Controller {
  static values = { message: String };

  connect() {
    this._dirty = false;
    this._onChange = () => this.markDirty();
    this._onSubmit = () => this.markClean();
    this._onBeforeUnload = (event) => {
      if (!this._dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    this._onBeforeVisit = (event) => {
      if (!this._dirty) return;
      if (!window.confirm(this.messageValue || DEFAULT_MESSAGE)) {
        event.preventDefault();
      }
    };

    this.element.addEventListener("input", this._onChange);
    this.element.addEventListener("change", this._onChange);
    this.element.addEventListener("submit", this._onSubmit);
    window.addEventListener("beforeunload", this._onBeforeUnload);
    document.addEventListener("turbo:before-visit", this._onBeforeVisit);
  }

  disconnect() {
    this.element.removeEventListener("input", this._onChange);
    this.element.removeEventListener("change", this._onChange);
    this.element.removeEventListener("submit", this._onSubmit);
    window.removeEventListener("beforeunload", this._onBeforeUnload);
    document.removeEventListener("turbo:before-visit", this._onBeforeVisit);
  }

  markDirty() {
    this._dirty = true;
  }

  markClean() {
    this._dirty = false;
  }
}
