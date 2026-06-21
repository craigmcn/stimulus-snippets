import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import DismissController from "./dismiss_controller";
import { getA11yViolations } from "../../test/axe";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("DismissController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("dismiss", DismissController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await tick();
  }

  it("removes the element from the DOM", async () => {
    await setup(`
      <div id="alert" data-controller="dismiss">
        <button id="btn" data-action="click->dismiss#dismiss">Close</button>
      </div>
    `);

    document.getElementById("btn").click();

    expect(document.getElementById("alert")).toBeNull();
  });

  it("sets hidden on the element", async () => {
    await setup(`
      <div id="alert" data-controller="dismiss">
        <button id="btn" data-action="click->dismiss#hide">Close</button>
      </div>
    `);

    document.getElementById("btn").click();

    expect(document.getElementById("alert").hidden).toBe(true);
  });

  it("hide leaves the element in the DOM", async () => {
    await setup(`
      <div id="alert" data-controller="dismiss">
        <button id="btn" data-action="click->dismiss#hide">Close</button>
      </div>
    `);

    document.getElementById("btn").click();

    expect(document.getElementById("alert")).not.toBeNull();
  });

  describe("accessibility", () => {
    it("has no detectable accessibility violations using the documented usage example", async () => {
      await setup(`
        <div id="alert" data-controller="dismiss" role="alert">
          <p>Your changes have been saved.</p>
          <button type="button" data-action="click->dismiss#dismiss" aria-label="Dismiss">
            &times;
          </button>
        </div>
      `);
      const violations = await getA11yViolations(
        document.getElementById("alert"),
      );
      expect(violations).toEqual([]);
    });
  });
});
