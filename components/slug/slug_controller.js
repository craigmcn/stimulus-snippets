import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["source", "output"];

  connect() {
    this.locked = this.hasOutputTarget && this.outputTarget.value !== "";
  }

  generate() {
    if (this.locked) return;
    if (!this.hasSourceTarget || !this.hasOutputTarget) return;
    this.outputTarget.value = toSlug(this.sourceTarget.value);
  }

  lock() {
    this.locked = true;
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
