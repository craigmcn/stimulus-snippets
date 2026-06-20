import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["input", "hidden"];
  static values = {
    locale: String,
    style: { type: String, default: "decimal" },
    currency: String,
    minimumFractionDigits: Number,
    maximumFractionDigits: Number,
  };

  connect() {
    const raw = this._sanitize(this.inputTarget.value);
    this._syncHidden(raw);
    this._display(raw);
  }

  format() {
    const input = this.inputTarget;
    const digitsBeforeCursor = this._countDigits(
      input.value.slice(0, input.selectionStart ?? input.value.length),
    );

    const raw = this._sanitize(input.value);
    input.value = this._group(raw);
    this._syncHidden(raw);

    const cursor = this._cursorAfterDigits(input.value, digitsBeforeCursor);
    input.setSelectionRange(cursor, cursor);
  }

  focus() {
    this.inputTarget.value = this._sanitize(this.inputTarget.value);
  }

  blur() {
    const raw = this._sanitize(this.inputTarget.value);
    this._syncHidden(raw);
    this._display(raw);
  }

  _display(raw) {
    if (raw === "" || raw === "-") return;
    const number = Number(raw);
    if (Number.isNaN(number)) return;

    let formatter;
    try {
      formatter = new Intl.NumberFormat(
        this.localeValue || undefined,
        this._formatOptions(),
      );
    } catch {
      return;
    }

    this.inputTarget.value = formatter.format(number);
  }

  _formatOptions() {
    const options = { style: this.styleValue };
    if (this.styleValue === "currency") {
      options.currency = this.currencyValue || "USD";
    }
    if (this.hasMinimumFractionDigitsValue) {
      options.minimumFractionDigits = this.minimumFractionDigitsValue;
    }
    if (this.hasMaximumFractionDigitsValue) {
      options.maximumFractionDigits = this.maximumFractionDigitsValue;
    }
    return options;
  }

  // Strips everything except digits and a single decimal point, regardless
  // of locale: round-tripping a locale's own grouping/decimal separators
  // (e.g. "1.234,56" in de-DE) back into a raw number is ambiguous, so typed
  // and submitted values always use a plain period as the decimal separator.
  _sanitize(value) {
    const negative = /^[-−]/.test(value.trim());
    const digitsAndDot = value.replace(/[^0-9.]/g, "");
    const firstDot = digitsAndDot.indexOf(".");
    const cleaned =
      firstDot === -1
        ? digitsAndDot
        : digitsAndDot.slice(0, firstDot + 1) +
          digitsAndDot.slice(firstDot + 1).replace(/\./g, "");
    return negative ? `-${cleaned}` : cleaned;
  }

  _group(raw) {
    if (raw === "" || raw === "-") return raw;
    const negative = raw.startsWith("-");
    const unsigned = negative ? raw.slice(1) : raw;
    const [integer, decimal] = unsigned.split(".");
    const groupedInteger = (integer || "0").replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ",",
    );
    const grouped =
      decimal === undefined ? groupedInteger : `${groupedInteger}.${decimal}`;
    return negative ? `-${grouped}` : grouped;
  }

  _syncHidden(raw) {
    if (this.hasHiddenTarget) this.hiddenTarget.value = raw;
  }

  _countDigits(value) {
    return (value.match(/[0-9]/g) || []).length;
  }

  _cursorAfterDigits(value, digitCount) {
    if (digitCount === 0) return 0;
    let seen = 0;
    for (let i = 0; i < value.length; i++) {
      if (/[0-9]/.test(value[i])) {
        seen += 1;
        if (seen === digitCount) return i + 1;
      }
    }
    return value.length;
  }
}
