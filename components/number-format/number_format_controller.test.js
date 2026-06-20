import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import NumberFormatController from "./number_format_controller";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("NumberFormatController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("number-format", NumberFormatController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await tick();
    return document.querySelector("[data-number-format-target='input']");
  }

  it("formats the initial value with thousands separators on connect", async () => {
    const input = await setup(`
      <input
        data-controller="number-format"
        data-number-format-locale-value="en-US"
        data-number-format-target="input"
        value="1234567"
      />
    `);

    expect(input.value).toBe("1,234,567");
  });

  it("groups digits live as the user types", async () => {
    const input = await setup(`
      <input
        data-controller="number-format"
        data-number-format-target="input"
        data-action="input->number-format#format"
      />
    `);

    input.value = "1234567";
    input.dispatchEvent(new Event("input"));
    await tick();

    expect(input.value).toBe("1,234,567");
  });

  it("preserves a trailing decimal point while typing", async () => {
    const input = await setup(`
      <input
        data-controller="number-format"
        data-number-format-target="input"
        data-action="input->number-format#format"
      />
    `);

    input.value = "1234.";
    input.dispatchEvent(new Event("input"));
    await tick();

    expect(input.value).toBe("1,234.");
  });

  it("syncs a clean numeric string to the hidden target while typing", async () => {
    document.body.innerHTML = `
      <div data-controller="number-format">
        <input
          data-number-format-target="input"
          data-action="input->number-format#format"
        />
        <input type="hidden" data-number-format-target="hidden" />
      </div>
    `;
    await tick();

    const input = document.querySelector("[data-number-format-target='input']");
    const hidden = document.querySelector(
      "[data-number-format-target='hidden']",
    );

    input.value = "1234.5";
    input.dispatchEvent(new Event("input"));
    await tick();

    expect(hidden.value).toBe("1234.5");
  });

  it("strips grouping and currency symbols back to a raw value on focus", async () => {
    const input = await setup(`
      <input
        data-controller="number-format"
        data-number-format-locale-value="en-US"
        data-number-format-style-value="currency"
        data-number-format-currency-value="USD"
        data-number-format-target="input"
        data-action="focus->number-format#focus blur->number-format#blur"
        value="1234.5"
      />
    `);

    expect(input.value).toBe("$1,234.50");

    input.dispatchEvent(new Event("focus"));
    await tick();

    expect(input.value).toBe("1234.50");
  });

  it("formats as currency on blur", async () => {
    const input = await setup(`
      <input
        data-controller="number-format"
        data-number-format-locale-value="en-US"
        data-number-format-style-value="currency"
        data-number-format-currency-value="USD"
        data-number-format-target="input"
        data-action="blur->number-format#blur"
      />
    `);

    input.value = "1234.5";
    input.dispatchEvent(new Event("blur"));
    await tick();

    expect(input.value).toBe("$1,234.50");
  });

  it("respects minimum and maximum fraction digits", async () => {
    const input = await setup(`
      <input
        data-controller="number-format"
        data-number-format-locale-value="en-US"
        data-number-format-minimum-fraction-digits-value="2"
        data-number-format-maximum-fraction-digits-value="2"
        data-number-format-target="input"
        data-action="blur->number-format#blur"
        value="1234.5"
      />
    `);

    expect(input.value).toBe("1,234.50");
  });

  it("handles negative numbers", async () => {
    const input = await setup(`
      <input
        data-controller="number-format"
        data-number-format-locale-value="en-US"
        data-number-format-target="input"
        data-action="input->number-format#format"
      />
    `);

    input.value = "-1234";
    input.dispatchEvent(new Event("input"));
    await tick();

    expect(input.value).toBe("-1,234");
  });

  it("clears the hidden target when the input is emptied", async () => {
    document.body.innerHTML = `
      <div data-controller="number-format">
        <input
          data-number-format-target="input"
          data-action="input->number-format#format blur->number-format#blur"
          value="1234"
        />
        <input type="hidden" data-number-format-target="hidden" />
      </div>
    `;
    await tick();

    const input = document.querySelector("[data-number-format-target='input']");
    const hidden = document.querySelector(
      "[data-number-format-target='hidden']",
    );

    input.value = "";
    input.dispatchEvent(new Event("input"));
    input.dispatchEvent(new Event("blur"));
    await tick();

    expect(hidden.value).toBe("");
    expect(input.value).toBe("");
  });

  it("does not throw and leaves the value as-is when the locale is invalid", async () => {
    const input = await setup(`
      <input
        data-controller="number-format"
        data-number-format-locale-value="en_US"
        data-number-format-target="input"
        value="1234"
      />
    `);

    expect(input.value).toBe("1234");
  });

  it("does not throw and leaves the value as-is when style is currency with no currency code", async () => {
    const input = await setup(`
      <input
        data-controller="number-format"
        data-number-format-locale-value="en-US"
        data-number-format-style-value="currency"
        data-number-format-currency-value="not-a-real-code"
        data-number-format-target="input"
        value="1234"
      />
    `);

    expect(input.value).toBe("1234");
  });
});
