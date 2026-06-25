import { Controller } from "@hotwired/stimulus";

// Standard MDN time-ago division table: each entry is how many of the
// current unit make up the next one, terminating in an unbounded "years".
const DIVISIONS = [
  { amount: 60, unit: "seconds" },
  { amount: 60, unit: "minutes" },
  { amount: 24, unit: "hours" },
  { amount: 7, unit: "days" },
  { amount: 4.34524, unit: "weeks" },
  { amount: 12, unit: "months" },
  { amount: Number.POSITIVE_INFINITY, unit: "years" },
];

export default class extends Controller {
  static values = {
    locale: String,
    style: { type: String, default: "long" },
    numeric: { type: String, default: "auto" },
    interval: { type: Number, default: 60000 },
  };

  connect() {
    this.element.setAttribute("aria-live", "polite");
    this.render();
    this._timer = setInterval(() => this.render(), this.intervalValue);
  }

  disconnect() {
    clearInterval(this._timer);
  }

  render() {
    const isoString = (
      this.element.getAttribute("datetime") || this.element.textContent
    ).trim();
    if (!isoString) return;

    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return;

    let formatter;
    try {
      formatter = new Intl.RelativeTimeFormat(this.localeValue || undefined, {
        style: this.styleValue,
        numeric: this.numericValue,
      });
    } catch {
      return;
    }

    let duration = (date.getTime() - Date.now()) / 1000;
    for (const division of DIVISIONS) {
      if (Math.abs(duration) < division.amount) {
        this.element.textContent = formatter.format(
          Math.round(duration),
          division.unit,
        );
        return;
      }
      duration /= division.amount;
    }
  }
}
