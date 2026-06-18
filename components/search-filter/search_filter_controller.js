import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["input", "item", "empty"];

  connect() {
    if (this.hasEmptyTarget && !this.emptyTarget.hasAttribute("aria-live")) {
      this.emptyTarget.setAttribute("aria-live", "polite");
    }
    this.filter();
  }

  filter() {
    if (!this.hasInputTarget) return;
    const query = this.inputTarget.value.trim().toLowerCase();
    let visibleCount = 0;

    this.itemTargets.forEach((item) => {
      const matches = query === "" || this._termFor(item).includes(query);
      item.hidden = !matches;
      if (matches) visibleCount++;
    });

    if (this.hasEmptyTarget) {
      this.emptyTarget.hidden = visibleCount !== 0;
    }
  }

  _termFor(item) {
    const term = item.dataset.searchFilterTerm;
    return (term !== undefined ? term : item.textContent).toLowerCase();
  }
}
