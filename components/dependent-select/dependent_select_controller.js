import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["group", "dependent"];

  connect() {
    this.filter();
  }

  filter() {
    if (!this.hasGroupTarget || !this.hasDependentTarget) return;

    const groupValue = this.groupTarget.value;
    const selectedValue = this.dependentTarget.value;
    let selectedStillMatches = false;

    Array.from(this.dependentTarget.options).forEach((option) => {
      const optionGroup = option.dataset.dependentSelectGroup;
      const matches = optionGroup === undefined || optionGroup === groupValue;

      option.hidden = !matches;
      option.disabled = !matches;

      if (matches && option.value === selectedValue) {
        selectedStillMatches = true;
      }
    });

    if (!selectedStillMatches) this.dependentTarget.value = "";
  }
}
