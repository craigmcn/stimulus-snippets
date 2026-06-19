import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    dateStyle: { type: String, default: "medium" },
    timeStyle: { type: String, default: "short" },
    locale: String,
    timeZone: String,
  };

  connect() {
    this.render();
  }

  render() {
    const isoString = (
      this.element.getAttribute("datetime") || this.element.textContent
    ).trim();
    if (!isoString) return;

    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return;

    const dateStyle =
      this.dateStyleValue === "none" ? undefined : this.dateStyleValue;
    const timeStyle =
      this.timeStyleValue === "none" ? undefined : this.timeStyleValue;
    if (!dateStyle && !timeStyle) return;

    let formatter;
    try {
      formatter = new Intl.DateTimeFormat(this.localeValue || undefined, {
        dateStyle,
        timeStyle,
        timeZone: this.timeZoneValue || undefined,
      });
    } catch {
      return;
    }

    this.element.textContent = formatter.format(date);
  }
}
