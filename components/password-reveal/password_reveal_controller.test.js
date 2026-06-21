import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import PasswordRevealController from "./password_reveal_controller";
import { getA11yViolations } from "../../test/axe";

const A11Y_HTML = `
  <div id="widget" data-controller="password-reveal">
    <label for="password">Password</label>
    <input
      id="password"
      type="password"
      name="password"
      autocomplete="current-password"
      data-password-reveal-target="input"
    />
    <button
      id="btn"
      type="button"
      data-action="click->password-reveal#toggle"
      aria-label="Toggle password visibility"
    >
      <span data-password-reveal-target="showLabel">Show</span>
      <span data-password-reveal-target="hideLabel" hidden>Hide</span>
    </button>
  </div>
`;

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("PasswordRevealController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("password-reveal", PasswordRevealController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await tick();
  }

  describe("input type toggle", () => {
    it("toggles a password input to text", async () => {
      await setup(`
        <div data-controller="password-reveal">
          <input id="input" type="password" data-password-reveal-target="input">
          <button id="btn" data-action="click->password-reveal#toggle">Show</button>
        </div>
      `);

      document.getElementById("btn").click();

      expect(document.getElementById("input").type).toBe("text");
    });

    it("toggles a text input back to password", async () => {
      await setup(`
        <div data-controller="password-reveal">
          <input id="input" type="text" data-password-reveal-target="input">
          <button id="btn" data-action="click->password-reveal#toggle">Hide</button>
        </div>
      `);

      document.getElementById("btn").click();

      expect(document.getElementById("input").type).toBe("password");
    });
  });

  describe("labels when revealing (password → text)", () => {
    it("hides showLabel", async () => {
      await setup(`
        <div data-controller="password-reveal">
          <input type="password" data-password-reveal-target="input">
          <span id="show-label" data-password-reveal-target="showLabel">Show</span>
          <button id="btn" data-action="click->password-reveal#toggle">Toggle</button>
        </div>
      `);

      document.getElementById("btn").click();

      expect(document.getElementById("show-label").hidden).toBe(true);
    });

    it("shows hideLabel", async () => {
      await setup(`
        <div data-controller="password-reveal">
          <input type="password" data-password-reveal-target="input">
          <span id="hide-label" data-password-reveal-target="hideLabel" hidden>Hide</span>
          <button id="btn" data-action="click->password-reveal#toggle">Toggle</button>
        </div>
      `);

      document.getElementById("btn").click();

      expect(document.getElementById("hide-label").hidden).toBe(false);
    });
  });

  describe("labels when hiding (text → password)", () => {
    it("shows showLabel", async () => {
      await setup(`
        <div data-controller="password-reveal">
          <input type="text" data-password-reveal-target="input">
          <span id="show-label" data-password-reveal-target="showLabel" hidden>Show</span>
          <button id="btn" data-action="click->password-reveal#toggle">Toggle</button>
        </div>
      `);

      document.getElementById("btn").click();

      expect(document.getElementById("show-label").hidden).toBe(false);
    });

    it("hides hideLabel", async () => {
      await setup(`
        <div data-controller="password-reveal">
          <input type="text" data-password-reveal-target="input">
          <span id="hide-label" data-password-reveal-target="hideLabel">Hide</span>
          <button id="btn" data-action="click->password-reveal#toggle">Toggle</button>
        </div>
      `);

      document.getElementById("btn").click();

      expect(document.getElementById("hide-label").hidden).toBe(true);
    });
  });

  it("works without label targets", async () => {
    await setup(`
      <div data-controller="password-reveal">
        <input id="input" type="password" data-password-reveal-target="input">
        <button id="btn" data-action="click->password-reveal#toggle">Toggle</button>
      </div>
    `);

    expect(() => document.getElementById("btn").click()).not.toThrow();
    expect(document.getElementById("input").type).toBe("text");
  });

  describe("accessibility", () => {
    it("has no detectable accessibility violations using the documented usage example", async () => {
      await setup(A11Y_HTML);
      const violations = await getA11yViolations(
        document.getElementById("widget"),
      );
      expect(violations).toEqual([]);
    });

    it("has no detectable accessibility violations once the password is revealed", async () => {
      await setup(A11Y_HTML);
      document.getElementById("btn").click();
      const violations = await getA11yViolations(
        document.getElementById("widget"),
      );
      expect(violations).toEqual([]);
    });
  });
});
