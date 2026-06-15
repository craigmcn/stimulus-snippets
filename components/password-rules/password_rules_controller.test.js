import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import PasswordRulesController from "./password_rules_controller";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("PasswordRulesController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("password-rules", PasswordRulesController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await tick();
  }

  function check(inputId = "input") {
    const input = document.getElementById(inputId);
    input.dispatchEvent(new Event("input"));
  }

  describe("min-length rule", () => {
    async function setupMinRule(min) {
      await setup(`
        <div data-controller="password-rules">
          <input id="input" type="password" data-password-rules-target="input" data-action="input->password-rules#check">
          <li id="rule" data-password-rules-target="rule" data-min="${min}">At least ${min} characters</li>
        </div>
      `);
    }

    it("sets data-valid to true when value meets the minimum length", async () => {
      await setupMinRule(8);
      document.getElementById("input").value = "password";
      check();
      expect(document.getElementById("rule").dataset.valid).toBe("true");
    });

    it("sets data-valid to false when value is too short", async () => {
      await setupMinRule(8);
      document.getElementById("input").value = "short";
      check();
      expect(document.getElementById("rule").dataset.valid).toBe("false");
    });

    it("passes when value length equals exactly the minimum", async () => {
      await setupMinRule(5);
      document.getElementById("input").value = "exact";
      check();
      expect(document.getElementById("rule").dataset.valid).toBe("true");
    });
  });

  describe("pattern rule", () => {
    async function setupPatternRule(pattern) {
      await setup(`
        <div data-controller="password-rules">
          <input id="input" type="password" data-password-rules-target="input" data-action="input->password-rules#check">
          <li id="rule" data-password-rules-target="rule" data-pattern="${pattern}">Must match</li>
        </div>
      `);
    }

    it("sets data-valid to true when value matches the pattern", async () => {
      await setupPatternRule("[A-Z]");
      document.getElementById("input").value = "hasUpperCase";
      check();
      expect(document.getElementById("rule").dataset.valid).toBe("true");
    });

    it("sets data-valid to false when value does not match the pattern", async () => {
      await setupPatternRule("[A-Z]");
      document.getElementById("input").value = "nouppercase";
      check();
      expect(document.getElementById("rule").dataset.valid).toBe("false");
    });

    it("leaves a malformed pattern rule invalid without throwing", async () => {
      await setupPatternRule("[invalid(");
      document.getElementById("input").value = "anything";
      expect(() => check()).not.toThrow();
      expect(document.getElementById("rule").dataset.valid).toBe("false");
    });
  });

  describe("multiple rules", () => {
    it("evaluates each rule independently", async () => {
      await setup(`
        <div data-controller="password-rules">
          <input id="input" type="password" data-password-rules-target="input" data-action="input->password-rules#check">
          <li id="min-rule" data-password-rules-target="rule" data-min="8">8+ characters</li>
          <li id="upper-rule" data-password-rules-target="rule" data-pattern="[A-Z]">Uppercase</li>
          <li id="digit-rule" data-password-rules-target="rule" data-pattern="[0-9]">Digit</li>
        </div>
      `);

      document.getElementById("input").value = "Password1";
      check();

      expect(document.getElementById("min-rule").dataset.valid).toBe("true");
      expect(document.getElementById("upper-rule").dataset.valid).toBe("true");
      expect(document.getElementById("digit-rule").dataset.valid).toBe("true");
    });

    it("marks only failing rules as invalid", async () => {
      await setup(`
        <div data-controller="password-rules">
          <input id="input" type="password" data-password-rules-target="input" data-action="input->password-rules#check">
          <li id="min-rule" data-password-rules-target="rule" data-min="8">8+ characters</li>
          <li id="upper-rule" data-password-rules-target="rule" data-pattern="[A-Z]">Uppercase</li>
        </div>
      `);

      document.getElementById("input").value = "short";
      check();

      expect(document.getElementById("min-rule").dataset.valid).toBe("false");
      expect(document.getElementById("upper-rule").dataset.valid).toBe("false");
    });
  });
});
