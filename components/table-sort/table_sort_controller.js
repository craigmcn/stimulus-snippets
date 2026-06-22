import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["header", "row"];

  connect() {
    this.headerTargets.forEach((header) => {
      header.closest("th")?.setAttribute("aria-sort", "none");
    });
  }

  sort(event) {
    const header = event.currentTarget;
    const th = header.closest("th");
    if (!th) return;

    const index = th.cellIndex;
    const type = header.dataset.tableSortType || this._detectType(index);
    const direction =
      th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";

    this.headerTargets.forEach((other) => {
      const otherTh = other.closest("th");
      if (otherTh && otherTh !== th) otherTh.setAttribute("aria-sort", "none");
    });
    th.setAttribute("aria-sort", direction);

    const rows = [...this.rowTargets];
    const tbody = rows[0]?.parentElement;
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });

    rows.sort((a, b) => {
      const aValue = this._valueFor(a, index, type);
      const bValue = this._valueFor(b, index, type);
      const comparison =
        type === "string" ? collator.compare(aValue, bValue) : aValue - bValue;
      return direction === "ascending" ? comparison : -comparison;
    });

    rows.forEach((row) => tbody?.appendChild(row));
  }

  _detectType(index) {
    const sample = this._rawValue(this.rowTargets[0], index);
    if (!sample) return "string";
    if (!Number.isNaN(Number(sample.replace(/,/g, "")))) return "number";
    if (!Number.isNaN(Date.parse(sample))) return "date";
    return "string";
  }

  _rawValue(row, index) {
    const cell = row?.cells[index];
    return cell?.dataset.tableSortValue ?? cell?.textContent.trim() ?? "";
  }

  _valueFor(row, index, type) {
    const raw = this._rawValue(row, index);
    if (type === "number") return Number(raw.replace(/,/g, "")) || 0;
    if (type === "date") return Date.parse(raw) || 0;
    return raw;
  }
}
