import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import AccordionController from "./accordion_controller";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

// All panels closed by default
const DEFAULT_HTML = `
  <div id="widget" data-controller="accordion">
    <h3>
      <button type="button" id="t0" data-accordion-target="trigger" data-action="click->accordion#toggle keydown->accordion#keydown" aria-expanded="false">Section One</button>
    </h3>
    <div id="p0" data-accordion-target="panel" hidden>Panel One</div>

    <h3>
      <button type="button" id="t1" data-accordion-target="trigger" data-action="click->accordion#toggle keydown->accordion#keydown" aria-expanded="false">Section Two</button>
    </h3>
    <div id="p1" data-accordion-target="panel" hidden>Panel Two</div>

    <h3>
      <button type="button" id="t2" data-accordion-target="trigger" data-action="click->accordion#toggle keydown->accordion#keydown" aria-expanded="false">Section Three</button>
    </h3>
    <div id="p2" data-accordion-target="panel" hidden>Panel Three</div>
  </div>
`;

// First panel open initially
const FIRST_OPEN_HTML = `
  <div id="widget" data-controller="accordion">
    <h3>
      <button type="button" id="t0" data-accordion-target="trigger" data-action="click->accordion#toggle keydown->accordion#keydown" aria-expanded="true">Section One</button>
    </h3>
    <div id="p0" data-accordion-target="panel">Panel One</div>

    <h3>
      <button type="button" id="t1" data-accordion-target="trigger" data-action="click->accordion#toggle keydown->accordion#keydown" aria-expanded="false">Section Two</button>
    </h3>
    <div id="p1" data-accordion-target="panel" hidden>Panel Two</div>
  </div>
`;

// Exclusive mode — all closed
const EXCLUSIVE_HTML = `
  <div id="widget" data-controller="accordion" data-accordion-exclusive-value="true">
    <h3>
      <button type="button" id="t0" data-accordion-target="trigger" data-action="click->accordion#toggle keydown->accordion#keydown" aria-expanded="false">Section One</button>
    </h3>
    <div id="p0" data-accordion-target="panel" hidden>Panel One</div>

    <h3>
      <button type="button" id="t1" data-accordion-target="trigger" data-action="click->accordion#toggle keydown->accordion#keydown" aria-expanded="false">Section Two</button>
    </h3>
    <div id="p1" data-accordion-target="panel" hidden>Panel Two</div>

    <h3>
      <button type="button" id="t2" data-accordion-target="trigger" data-action="click->accordion#toggle keydown->accordion#keydown" aria-expanded="false">Section Three</button>
    </h3>
    <div id="p2" data-accordion-target="panel" hidden>Panel Three</div>
  </div>
`;

describe("AccordionController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("accordion", AccordionController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(html = DEFAULT_HTML) {
    document.body.innerHTML = html;
    await tick();
  }

  function keydown(target, key) {
    target.dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
    );
  }

  describe("ARIA setup on connect", () => {
    it("sets aria-expanded=false on triggers for closed panels", async () => {
      await setup();
      expect(document.getElementById("t0").getAttribute("aria-expanded")).toBe(
        "false",
      );
      expect(document.getElementById("t1").getAttribute("aria-expanded")).toBe(
        "false",
      );
      expect(document.getElementById("t2").getAttribute("aria-expanded")).toBe(
        "false",
      );
    });

    it("sets aria-expanded=true on a trigger whose panel starts open", async () => {
      await setup(FIRST_OPEN_HTML);
      expect(document.getElementById("t0").getAttribute("aria-expanded")).toBe(
        "true",
      );
      expect(document.getElementById("t1").getAttribute("aria-expanded")).toBe(
        "false",
      );
    });

    it("sets aria-controls on each trigger pointing to its panel", async () => {
      await setup();
      expect(document.getElementById("t0").getAttribute("aria-controls")).toBe(
        "p0",
      );
      expect(document.getElementById("t1").getAttribute("aria-controls")).toBe(
        "p1",
      );
      expect(document.getElementById("t2").getAttribute("aria-controls")).toBe(
        "p2",
      );
    });

    it("sets aria-labelledby on each panel pointing to its trigger", async () => {
      await setup();
      expect(
        document.getElementById("p0").getAttribute("aria-labelledby"),
      ).toBe("t0");
      expect(
        document.getElementById("p1").getAttribute("aria-labelledby"),
      ).toBe("t1");
      expect(
        document.getElementById("p2").getAttribute("aria-labelledby"),
      ).toBe("t2");
    });

    it("generates IDs for triggers and panels that lack them", async () => {
      await setup(`
        <div data-controller="accordion">
          <h3>
            <button type="button" data-accordion-target="trigger" data-action="click->accordion#toggle">Section</button>
          </h3>
          <div data-accordion-target="panel" hidden>Content</div>
        </div>
      `);
      const trigger = document.querySelector(
        "[data-accordion-target='trigger']",
      );
      const panel = document.querySelector("[data-accordion-target='panel']");
      expect(trigger.id).toBeTruthy();
      expect(panel.id).toBeTruthy();
      expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
      expect(panel.getAttribute("aria-labelledby")).toBe(trigger.id);
    });

    it("assigns unique IDs when multiple controllers lack ids", async () => {
      await setup(`
        <div data-controller="accordion">
          <h3><button type="button" data-accordion-target="trigger" data-action="click->accordion#toggle">A</button></h3>
          <div data-accordion-target="panel" hidden>A content</div>
        </div>
        <div data-controller="accordion">
          <h3><button type="button" data-accordion-target="trigger" data-action="click->accordion#toggle">B</button></h3>
          <div data-accordion-target="panel" hidden>B content</div>
        </div>
      `);
      const [a, b] = document.querySelectorAll("[data-controller='accordion']");
      expect(a.id).toBeTruthy();
      expect(b.id).toBeTruthy();
      expect(a.id).not.toBe(b.id);
    });

    it("all panels are hidden initially when all start closed", async () => {
      await setup();
      expect(document.getElementById("p0").hidden).toBe(true);
      expect(document.getElementById("p1").hidden).toBe(true);
      expect(document.getElementById("p2").hidden).toBe(true);
    });
  });

  describe("toggle", () => {
    it("opens a closed panel when its trigger is clicked", async () => {
      await setup();
      document.getElementById("t0").click();
      expect(document.getElementById("p0").hidden).toBe(false);
    });

    it("sets aria-expanded=true when opening a panel", async () => {
      await setup();
      document.getElementById("t0").click();
      expect(document.getElementById("t0").getAttribute("aria-expanded")).toBe(
        "true",
      );
    });

    it("closes an open panel when its trigger is clicked again", async () => {
      await setup();
      document.getElementById("t0").click();
      document.getElementById("t0").click();
      expect(document.getElementById("p0").hidden).toBe(true);
    });

    it("sets aria-expanded=false when closing a panel", async () => {
      await setup();
      document.getElementById("t0").click();
      document.getElementById("t0").click();
      expect(document.getElementById("t0").getAttribute("aria-expanded")).toBe(
        "false",
      );
    });

    it("allows multiple panels open at once in default mode", async () => {
      await setup();
      document.getElementById("t0").click();
      document.getElementById("t1").click();
      expect(document.getElementById("p0").hidden).toBe(false);
      expect(document.getElementById("p1").hidden).toBe(false);
    });

    it("leaves other panels unaffected when toggling one in default mode", async () => {
      await setup();
      document.getElementById("t1").click();
      expect(document.getElementById("p0").hidden).toBe(true);
      expect(document.getElementById("p2").hidden).toBe(true);
    });
  });

  describe("exclusive mode", () => {
    it("closes other open panels when opening a new one", async () => {
      await setup(EXCLUSIVE_HTML);
      document.getElementById("t0").click();
      document.getElementById("t1").click();
      expect(document.getElementById("p0").hidden).toBe(true);
      expect(document.getElementById("p1").hidden).toBe(false);
    });

    it("sets aria-expanded=false on the closed panel's trigger", async () => {
      await setup(EXCLUSIVE_HTML);
      document.getElementById("t0").click();
      document.getElementById("t1").click();
      expect(document.getElementById("t0").getAttribute("aria-expanded")).toBe(
        "false",
      );
    });

    it("still allows closing the open panel by clicking its trigger", async () => {
      await setup(EXCLUSIVE_HTML);
      document.getElementById("t0").click();
      document.getElementById("t0").click();
      expect(document.getElementById("p0").hidden).toBe(true);
      expect(document.getElementById("t0").getAttribute("aria-expanded")).toBe(
        "false",
      );
    });

    it("closes all but the first open panel on connect if multiple start open", async () => {
      await setup(`
        <div id="widget" data-controller="accordion" data-accordion-exclusive-value="true">
          <h3><button type="button" id="t0" data-accordion-target="trigger" data-action="click->accordion#toggle" aria-expanded="true">One</button></h3>
          <div id="p0" data-accordion-target="panel">Panel One</div>

          <h3><button type="button" id="t1" data-accordion-target="trigger" data-action="click->accordion#toggle" aria-expanded="true">Two</button></h3>
          <div id="p1" data-accordion-target="panel">Panel Two</div>

          <h3><button type="button" id="t2" data-accordion-target="trigger" data-action="click->accordion#toggle" aria-expanded="true">Three</button></h3>
          <div id="p2" data-accordion-target="panel">Panel Three</div>
        </div>
      `);
      expect(document.getElementById("p0").hidden).toBe(false);
      expect(document.getElementById("p1").hidden).toBe(true);
      expect(document.getElementById("p2").hidden).toBe(true);
      expect(document.getElementById("t0").getAttribute("aria-expanded")).toBe(
        "true",
      );
      expect(document.getElementById("t1").getAttribute("aria-expanded")).toBe(
        "false",
      );
      expect(document.getElementById("t2").getAttribute("aria-expanded")).toBe(
        "false",
      );
    });
  });

  describe("keydown navigation", () => {
    it("ArrowDown moves focus to the next trigger", async () => {
      await setup();
      document.getElementById("t0").focus();
      keydown(document.getElementById("t0"), "ArrowDown");
      expect(document.activeElement).toBe(document.getElementById("t1"));
    });

    it("ArrowUp moves focus to the previous trigger", async () => {
      await setup();
      document.getElementById("t1").focus();
      keydown(document.getElementById("t1"), "ArrowUp");
      expect(document.activeElement).toBe(document.getElementById("t0"));
    });

    it("ArrowDown wraps from the last trigger to the first", async () => {
      await setup();
      document.getElementById("t2").focus();
      keydown(document.getElementById("t2"), "ArrowDown");
      expect(document.activeElement).toBe(document.getElementById("t0"));
    });

    it("ArrowUp wraps from the first trigger to the last", async () => {
      await setup();
      document.getElementById("t0").focus();
      keydown(document.getElementById("t0"), "ArrowUp");
      expect(document.activeElement).toBe(document.getElementById("t2"));
    });

    it("Home moves focus to the first trigger", async () => {
      await setup();
      document.getElementById("t2").focus();
      keydown(document.getElementById("t2"), "Home");
      expect(document.activeElement).toBe(document.getElementById("t0"));
    });

    it("End moves focus to the last trigger", async () => {
      await setup();
      document.getElementById("t0").focus();
      keydown(document.getElementById("t0"), "End");
      expect(document.activeElement).toBe(document.getElementById("t2"));
    });

    it("ignores unrelated keys", async () => {
      await setup();
      document.getElementById("t0").focus();
      keydown(document.getElementById("t0"), "Tab");
      expect(document.activeElement).toBe(document.getElementById("t0"));
    });

    it("does not open or close a panel on arrow key", async () => {
      await setup();
      keydown(document.getElementById("t0"), "ArrowDown");
      expect(document.getElementById("p0").hidden).toBe(true);
      expect(document.getElementById("p1").hidden).toBe(true);
    });
  });
});
