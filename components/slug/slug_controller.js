import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["source", "output"];
  static values = { locked: { type: Boolean, default: false } };

  connect() {
    if (
      !this.lockedValue &&
      this.hasOutputTarget &&
      this.outputTarget.value !== ""
    ) {
      this.lockedValue = true;
    }
  }

  generate() {
    if (this.lockedValue) return;
    if (!this.hasSourceTarget || !this.hasOutputTarget) return;
    this.outputTarget.value = toSlug(this.sourceTarget.value);
  }

  lock() {
    this.lockedValue = true;
  }
}

export function toSlug(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
