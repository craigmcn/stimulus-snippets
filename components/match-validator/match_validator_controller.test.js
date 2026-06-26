import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Application } from "@hotwired/stimulus";
import MatchValidatorController from "./match_validator_controller";
import { getA11yViolations } from "../../test/axe";

const A11Y_HTML = `
  <form id="form">
    <div id="group" data-controller="match-validator">
      <label for="password">Password</label>
      <input id="password" type="password" data-match-validator-target="field" data-action="input->match-validator#validate">

      <label for="password_confirmation">Confirm password</label>
      <input id="password_confirmation" type="password" data-match-validator-target="match" data-action="input->match-validator#validate">

      <p data-match-validator-target="error" hidden>Passwords don't match.</p>
    </div>
    <button type="submit">Submit</button>
  </form>
`;

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const DEFAULT_HTML = `
  <form id="form">
    <div id="group" data-controller="match-validator">
      <input id="field" data-match-validator-target="field" data-action="input->match-validator#validate">
      <input id="match" data-match-validator-target="match" data-action="input->match-validator#validate">
      <p id="error" data-match-validator-target="error" hidden>Error</p>
    </div>
    <button type="submit">Submit</button>
  </form>
`;

describe("MatchValidatorController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("match-validator", MatchValidatorController);
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

  function setValue(id, value) {
    const input = document.getElementById(id);
    input.value = value;
    input.dispatchEvent(new Event("input"));
  }

  describe("form submit", () => {
    it("prevents submission when the fields don't match", async () => {
      await setup();
      setValue("field", "secret");
      setValue("match", "different");
      expect(submitForm().defaultPrevented).toBe(true);
    });

    it("allows submission when the fields match", async () => {
      await setup();
      setValue("field", "secret");
      setValue("match", "secret");
      expect(submitForm().defaultPrevented).toBe(false);
    });

    it("allows submission when both fields are empty", async () => {
      await setup();
      expect(submitForm().defaultPrevented).toBe(false);
    });
  });

  describe("error target", () => {
    it("shows the error target when the fields don't match", async () => {
      await setup();
      setValue("field", "secret");
      setValue("match", "different");
      expect(document.getElementById("error").hidden).toBe(false);
    });

    it("hides the error target when the fields match", async () => {
      await setup();
      setValue("field", "secret");
      setValue("match", "secret");
      expect(document.getElementById("error").hidden).toBe(true);
    });
  });

  describe("data-valid attribute", () => {
    it("sets data-valid to true on connect when both fields are empty", async () => {
      await setup();
      expect(document.getElementById("group").dataset.valid).toBe("true");
    });

    it("sets data-valid to false when the fields don't match", async () => {
      await setup();
      setValue("field", "secret");
      setValue("match", "different");
      expect(document.getElementById("group").dataset.valid).toBe("false");
    });

    it("sets data-valid to true when the fields match", async () => {
      await setup();
      setValue("field", "secret");
      setValue("match", "secret");
      expect(document.getElementById("group").dataset.valid).toBe("true");
    });
  });

  describe("aria-invalid", () => {
    it("sets aria-invalid to true on the match target when invalid", async () => {
      await setup();
      setValue("field", "secret");
      setValue("match", "different");
      expect(
        document.getElementById("match").getAttribute("aria-invalid"),
      ).toBe("true");
    });

    it("sets aria-invalid to false on the match target when valid", async () => {
      await setup();
      setValue("field", "secret");
      setValue("match", "secret");
      expect(
        document.getElementById("match").getAttribute("aria-invalid"),
      ).toBe("false");
    });
  });

  describe("case-sensitive value", () => {
    it("treats different-cased values as a mismatch by default", async () => {
      await setup();
      setValue("field", "Secret");
      setValue("match", "secret");
      expect(submitForm().defaultPrevented).toBe(true);
    });

    it("treats different-cased values as a match when case-sensitive is false", async () => {
      await setup(`
        <form id="form">
          <div data-controller="match-validator" data-match-validator-case-sensitive-value="false">
            <input id="field" data-match-validator-target="field" data-action="input->match-validator#validate">
            <input id="match" data-match-validator-target="match" data-action="input->match-validator#validate">
          </div>
        </form>
      `);
      setValue("field", "Secret");
      setValue("match", "secret");
      expect(submitForm().defaultPrevented).toBe(false);
    });
  });

  it("works without an error target", async () => {
    await setup(`
      <form id="form">
        <div data-controller="match-validator">
          <input id="field" data-match-validator-target="field">
          <input id="match" data-match-validator-target="match">
        </div>
      </form>
    `);
    setValue("field", "secret");
    setValue("match", "different");
    expect(() => submitForm()).not.toThrow();
    expect(submitForm().defaultPrevented).toBe(true);
  });

  it("warns when the controller element is not inside a form", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await setup(`
      <div data-controller="match-validator">
        <input id="field" data-match-validator-target="field">
        <input id="match" data-match-validator-target="match">
      </div>
    `);
    expect(warn).toHaveBeenCalledWith(
      "[match-validator] controller element is not inside a <form>; submit validation will not work.",
    );
    warn.mockRestore();
  });

  describe("accessibility", () => {
    it("has no detectable accessibility violations when valid", async () => {
      await setup(A11Y_HTML);
      const violations = await getA11yViolations(
        document.getElementById("group"),
      );
      expect(violations).toEqual([]);
    });

    it("has no detectable accessibility violations once the error is shown", async () => {
      await setup(A11Y_HTML);
      setValue("password", "secret");
      setValue("password_confirmation", "different");
      const violations = await getA11yViolations(
        document.getElementById("group"),
      );
      expect(violations).toEqual([]);
    });
  });
});
