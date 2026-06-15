import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["input", "rule"];

  check() {
    const value = this.inputTarget.value;

    this.ruleTargets.forEach((rule) => {
      const { min, pattern } = rule.dataset;
      let passes = false;

      if (min !== undefined) {
        const minNum = parseInt(min, 10);
        passes = !Number.isNaN(minNum) && value.length >= minNum;
      } else if (pattern !== undefined) {
        try {
          passes = new RegExp(pattern).test(value);
        } catch {
          passes = false;
        }
      }

      rule.dataset.valid = passes;
    });
  }
}
