import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["input", "showLabel", "hideLabel"];

  toggle() {
    const isPassword = this.inputTarget.type === "password";
    this.inputTarget.type = isPassword ? "text" : "password";
    if (this.hasShowLabelTarget) this.showLabelTarget.hidden = isPassword;
    if (this.hasHideLabelTarget) this.hideLabelTarget.hidden = !isPassword;
  }
}
