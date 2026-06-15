import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["input", "count", "remaining"];
  static values = { max: Number };

  connect() {
    if (this.hasCountTarget && !this.countTarget.hasAttribute("aria-live")) {
      this.countTarget.setAttribute("aria-live", "polite");
    }
    if (
      this.hasRemainingTarget &&
      !this.remainingTarget.hasAttribute("aria-live")
    ) {
      this.remainingTarget.setAttribute("aria-live", "polite");
    }
    this.update();
  }

  get max() {
    if (!this.hasInputTarget) return null;
    const maxlength = this.inputTarget.getAttribute("maxlength");
    if (maxlength !== null) return parseInt(maxlength, 10);
    if (this.hasMaxValue) return this.maxValue;
    return null;
  }

  update() {
    if (!this.hasInputTarget) return;
    const length = this.inputTarget.value.length;
    if (this.hasCountTarget) {
      this.countTarget.textContent = length;
    }
    const max = this.max;
    if (this.hasRemainingTarget && max !== null) {
      this.remainingTarget.textContent = max - length;
    }
  }
}
