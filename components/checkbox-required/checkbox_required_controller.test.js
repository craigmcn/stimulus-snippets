import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import CheckboxRequiredController from "./checkbox_required_controller";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const DEFAULT_HTML = `
  <form id="form">
    <fieldset id="group" data-controller="checkbox-required">
      <input type="checkbox" id="a" data-checkbox-required-target="checkbox" data-action="change->checkbox-required#validate">
      <input type="checkbox" id="b" data-checkbox-required-target="checkbox" data-action="change->checkbox-required#validate">
      <p id="error" data-checkbox-required-target="error" hidden>Error</p>
    </fieldset>
    <button type="submit">Submit</button>
  </form>
`;

describe("CheckboxRequiredController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("checkbox-required", CheckboxRequiredController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(html = DEFAULT_HTML) {
    document.body.innerHTML = html;
    await tick();
  }

  function submitForm(formId = "form") {
    const form = document.getElementById(formId);
    const event = new Event("submit", { cancelable: true, bubbles: true });
    form.dispatchEvent(event);
    return event;
  }

  describe("form submit", () => {
    it("prevents submission when no checkboxes are checked", async () => {
      await setup();
      expect(submitForm().defaultPrevented).toBe(true);
    });

    it("allows submission when at least one checkbox is checked", async () => {
      await setup();
      document.getElementById("a").checked = true;
      expect(submitForm().defaultPrevented).toBe(false);
    });
  });

  describe("error target", () => {
    it("shows the error target when invalid", async () => {
      await setup();
      submitForm();
      expect(document.getElementById("error").hidden).toBe(false);
    });

    it("hides the error target when valid", async () => {
      await setup();
      document.getElementById("a").checked = true;
      submitForm();
      expect(document.getElementById("error").hidden).toBe(true);
    });
  });

  describe("data-valid attribute", () => {
    it("sets data-valid to false when invalid", async () => {
      await setup();
      submitForm();
      expect(document.getElementById("group").dataset.valid).toBe("false");
    });

    it("sets data-valid to true when valid", async () => {
      await setup();
      document.getElementById("a").checked = true;
      submitForm();
      expect(document.getElementById("group").dataset.valid).toBe("true");
    });
  });

  describe("live validation on change", () => {
    it("shows the error target when no boxes are checked", async () => {
      await setup();
      const a = document.getElementById("a");
      a.dispatchEvent(new Event("change"));
      expect(document.getElementById("error").hidden).toBe(false);
    });

    it("hides the error target when a box is checked", async () => {
      await setup();
      const a = document.getElementById("a");
      a.checked = true;
      a.dispatchEvent(new Event("change"));
      expect(document.getElementById("error").hidden).toBe(true);
    });
  });

  describe("min value", () => {
    it("prevents submission when checked count is below min", async () => {
      await setup(`
        <form id="form">
          <fieldset data-controller="checkbox-required" data-checkbox-required-min-value="2">
            <input type="checkbox" id="a" checked data-checkbox-required-target="checkbox" data-action="change->checkbox-required#validate">
            <input type="checkbox" id="b" data-checkbox-required-target="checkbox" data-action="change->checkbox-required#validate">
          </fieldset>
        </form>
      `);
      expect(submitForm().defaultPrevented).toBe(true);
    });

    it("allows submission when checked count meets min", async () => {
      await setup(`
        <form id="form">
          <fieldset data-controller="checkbox-required" data-checkbox-required-min-value="2">
            <input type="checkbox" id="a" checked data-checkbox-required-target="checkbox" data-action="change->checkbox-required#validate">
            <input type="checkbox" id="b" checked data-checkbox-required-target="checkbox" data-action="change->checkbox-required#validate">
          </fieldset>
        </form>
      `);
      expect(submitForm().defaultPrevented).toBe(false);
    });
  });

  it("works without an error target", async () => {
    await setup(`
      <form id="form">
        <fieldset data-controller="checkbox-required">
          <input type="checkbox" id="a" data-checkbox-required-target="checkbox">
        </fieldset>
      </form>
    `);
    expect(() => submitForm()).not.toThrow();
    expect(submitForm().defaultPrevented).toBe(true);
  });
});
