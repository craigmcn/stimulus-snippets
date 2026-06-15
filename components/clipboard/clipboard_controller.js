import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["source", "feedback"];
  static values = {
    successDuration: { type: Number, default: 2000 },
  };

  copy() {
    const source = this.sourceTarget;
    const text = "value" in source ? source.value : source.textContent.trim();

    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (this.hasFeedbackTarget) {
          this.feedbackTarget.hidden = false;
          this._timer = setTimeout(
            () => (this.feedbackTarget.hidden = true),
            this.successDurationValue,
          );
        }
      })
      .catch(() => {});
  }

  disconnect() {
    clearTimeout(this._timer);
  }
}
