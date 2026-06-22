import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import CharacterCountController from "./character_count_controller";
import { getA11yViolations } from "../../test/axe";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("CharacterCountController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("character-count", CharacterCountController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await tick();
  }

  describe("connect", () => {
    it("adds aria-live to the count target", async () => {
      await setup(`
        <div data-controller="character-count">
          <textarea data-character-count-target="input"></textarea>
          <span id="count" data-character-count-target="count"></span>
        </div>
      `);

      expect(document.getElementById("count").getAttribute("aria-live")).toBe(
        "polite",
      );
    });

    it("adds aria-live to the remaining target", async () => {
      await setup(`
        <div data-controller="character-count" data-character-count-max-value="100">
          <textarea data-character-count-target="input"></textarea>
          <span id="remaining" data-character-count-target="remaining"></span>
        </div>
      `);

      expect(
        document.getElementById("remaining").getAttribute("aria-live"),
      ).toBe("polite");
    });

    it("does not override an existing aria-live on count", async () => {
      await setup(`
        <div data-controller="character-count">
          <textarea data-character-count-target="input"></textarea>
          <span id="count" data-character-count-target="count" aria-live="assertive"></span>
        </div>
      `);

      expect(document.getElementById("count").getAttribute("aria-live")).toBe(
        "assertive",
      );
    });

    it("shows the initial count on connect", async () => {
      await setup(`
        <div data-controller="character-count">
          <textarea data-character-count-target="input">hello</textarea>
          <span id="count" data-character-count-target="count"></span>
        </div>
      `);

      expect(document.getElementById("count").textContent).toBe("5");
    });

    it("shows the initial remaining on connect", async () => {
      await setup(`
        <div data-controller="character-count" data-character-count-max-value="10">
          <textarea data-character-count-target="input">hello</textarea>
          <span id="remaining" data-character-count-target="remaining"></span>
        </div>
      `);

      expect(document.getElementById("remaining").textContent).toBe("5");
    });
  });

  describe("update", () => {
    it("updates the count when the input changes", async () => {
      await setup(`
        <div data-controller="character-count">
          <textarea id="input" data-character-count-target="input" data-action="input->character-count#update"></textarea>
          <span id="count" data-character-count-target="count"></span>
        </div>
      `);

      const input = document.getElementById("input");
      input.value = "hello";
      input.dispatchEvent(new Event("input"));

      expect(document.getElementById("count").textContent).toBe("5");
    });

    it("updates the remaining when the input changes", async () => {
      await setup(`
        <div data-controller="character-count" data-character-count-max-value="10">
          <textarea id="input" data-character-count-target="input" data-action="input->character-count#update"></textarea>
          <span id="remaining" data-character-count-target="remaining"></span>
        </div>
      `);

      const input = document.getElementById("input");
      input.value = "hello";
      input.dispatchEvent(new Event("input"));

      expect(document.getElementById("remaining").textContent).toBe("5");
    });

    it("reads max from the input's maxlength attribute", async () => {
      await setup(`
        <div data-controller="character-count">
          <textarea id="input" maxlength="20" data-character-count-target="input" data-action="input->character-count#update"></textarea>
          <span id="remaining" data-character-count-target="remaining"></span>
        </div>
      `);

      const input = document.getElementById("input");
      input.value = "hello";
      input.dispatchEvent(new Event("input"));

      expect(document.getElementById("remaining").textContent).toBe("15");
    });

    it("prefers maxlength attribute over max value", async () => {
      await setup(`
        <div data-controller="character-count" data-character-count-max-value="50">
          <textarea id="input" maxlength="20" data-character-count-target="input" data-action="input->character-count#update"></textarea>
          <span id="remaining" data-character-count-target="remaining"></span>
        </div>
      `);

      const input = document.getElementById("input");
      input.value = "hello";
      input.dispatchEvent(new Event("input"));

      expect(document.getElementById("remaining").textContent).toBe("15");
    });

    it("does not update remaining when no max is set", async () => {
      await setup(`
        <div data-controller="character-count">
          <textarea id="input" data-character-count-target="input" data-action="input->character-count#update"></textarea>
          <span id="remaining" data-character-count-target="remaining">—</span>
        </div>
      `);

      const input = document.getElementById("input");
      input.value = "hello";
      input.dispatchEvent(new Event("input"));

      expect(document.getElementById("remaining").textContent).toBe("—");
    });
  });

  describe("accessibility", () => {
    it("has no detectable accessibility violations using the documented usage example", async () => {
      await setup(`
        <div id="widget" data-controller="character-count" data-character-count-max-value="280">
          <label for="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            maxlength="280"
            data-character-count-target="input"
            data-action="input->character-count#update"
          ></textarea>
          <p>
            <span data-character-count-target="remaining">280</span> characters remaining
          </p>
        </div>
      `);
      const violations = await getA11yViolations(
        document.getElementById("widget"),
      );
      expect(violations).toEqual([]);
    });
  });
});
