import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["input", "rule"];

  check() {
    const value = this.inputTarget.value;

    this.ruleTargets.forEach((rule) => {
      const { min, pattern } = rule.dataset;
      let passes = false;

      if (min !== undefined) {
        passes = value.length >= parseInt(min, 10);
      } else if (pattern !== undefined) {
        passes = new RegExp(pattern).test(value);
      }

      rule.dataset.valid = passes;
    });
  }
}
