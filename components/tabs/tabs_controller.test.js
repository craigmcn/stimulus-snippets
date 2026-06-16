import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import TabsController from "./tabs_controller";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const DEFAULT_HTML = `
  <div id="widget" data-controller="tabs">
    <div role="tablist">
      <button type="button" id="t0" data-tabs-target="tab" data-action="click->tabs#select keydown->tabs#keydown">Tab 1</button>
      <button type="button" id="t1" data-tabs-target="tab" data-action="click->tabs#select keydown->tabs#keydown">Tab 2</button>
      <button type="button" id="t2" data-tabs-target="tab" data-action="click->tabs#select keydown->tabs#keydown">Tab 3</button>
    </div>
    <div id="p0" data-tabs-target="panel">Panel 1</div>
    <div id="p1" data-tabs-target="panel">Panel 2</div>
    <div id="p2" data-tabs-target="panel">Panel 3</div>
  </div>
`;

describe("TabsController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("tabs", TabsController);
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
    it("sets role=tab on each tab target", async () => {
      await setup();
      ["t0", "t1", "t2"].forEach((id) => {
        expect(document.getElementById(id).getAttribute("role")).toBe("tab");
      });
    });

    it("sets role=tabpanel on each panel target", async () => {
      await setup();
      ["p0", "p1", "p2"].forEach((id) => {
        expect(document.getElementById(id).getAttribute("role")).toBe(
          "tabpanel",
        );
      });
    });

    it("sets tabindex=0 on each panel", async () => {
      await setup();
      ["p0", "p1", "p2"].forEach((id) => {
        expect(document.getElementById(id).getAttribute("tabindex")).toBe("0");
      });
    });

    it("sets aria-controls on each tab pointing to its panel", async () => {
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

    it("sets aria-labelledby on each panel pointing to its tab", async () => {
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

    it("marks the first tab selected by default", async () => {
      await setup();
      expect(document.getElementById("t0").getAttribute("aria-selected")).toBe(
        "true",
      );
      expect(document.getElementById("t1").getAttribute("aria-selected")).toBe(
        "false",
      );
      expect(document.getElementById("t2").getAttribute("aria-selected")).toBe(
        "false",
      );
    });

    it("shows only the first panel by default", async () => {
      await setup();
      expect(document.getElementById("p0").hidden).toBe(false);
      expect(document.getElementById("p1").hidden).toBe(true);
      expect(document.getElementById("p2").hidden).toBe(true);
    });

    it("sets tabindex=0 on the selected tab and -1 on others", async () => {
      await setup();
      expect(document.getElementById("t0").getAttribute("tabindex")).toBe("0");
      expect(document.getElementById("t1").getAttribute("tabindex")).toBe("-1");
      expect(document.getElementById("t2").getAttribute("tabindex")).toBe("-1");
    });

    it("respects data-tabs-index-value for the initial selection", async () => {
      await setup(`
        <div id="widget" data-controller="tabs" data-tabs-index-value="1">
          <div role="tablist">
            <button type="button" id="t0" data-tabs-target="tab" data-action="click->tabs#select keydown->tabs#keydown">Tab 1</button>
            <button type="button" id="t1" data-tabs-target="tab" data-action="click->tabs#select keydown->tabs#keydown">Tab 2</button>
          </div>
          <div id="p0" data-tabs-target="panel">Panel 1</div>
          <div id="p1" data-tabs-target="panel">Panel 2</div>
        </div>
      `);
      expect(document.getElementById("t1").getAttribute("aria-selected")).toBe(
        "true",
      );
      expect(document.getElementById("p0").hidden).toBe(true);
      expect(document.getElementById("p1").hidden).toBe(false);
    });

    it("generates IDs for tabs and panels that lack them", async () => {
      await setup(`
        <div data-controller="tabs">
          <div role="tablist">
            <button type="button" data-tabs-target="tab" data-action="click->tabs#select keydown->tabs#keydown">Tab 1</button>
          </div>
          <div data-tabs-target="panel">Panel 1</div>
        </div>
      `);
      const tab = document.querySelector("[data-tabs-target='tab']");
      const panel = document.querySelector("[data-tabs-target='panel']");
      expect(tab.id).toBeTruthy();
      expect(panel.id).toBeTruthy();
      expect(tab.getAttribute("aria-controls")).toBe(panel.id);
      expect(panel.getAttribute("aria-labelledby")).toBe(tab.id);
    });
  });

  describe("select", () => {
    it("activates the clicked tab", async () => {
      await setup();
      document.getElementById("t1").click();
      expect(document.getElementById("t1").getAttribute("aria-selected")).toBe(
        "true",
      );
      expect(document.getElementById("t0").getAttribute("aria-selected")).toBe(
        "false",
      );
    });

    it("shows the clicked tab's panel and hides the others", async () => {
      await setup();
      document.getElementById("t1").click();
      expect(document.getElementById("p0").hidden).toBe(true);
      expect(document.getElementById("p1").hidden).toBe(false);
      expect(document.getElementById("p2").hidden).toBe(true);
    });

    it("updates tabindex on the newly selected tab", async () => {
      await setup();
      document.getElementById("t2").click();
      expect(document.getElementById("t2").getAttribute("tabindex")).toBe("0");
      expect(document.getElementById("t0").getAttribute("tabindex")).toBe("-1");
      expect(document.getElementById("t1").getAttribute("tabindex")).toBe("-1");
    });
  });

  describe("keydown navigation", () => {
    it("ArrowRight moves to the next tab", async () => {
      await setup();
      keydown(document.getElementById("t0"), "ArrowRight");
      expect(document.getElementById("t1").getAttribute("aria-selected")).toBe(
        "true",
      );
    });

    it("ArrowLeft moves to the previous tab", async () => {
      await setup();
      document.getElementById("t1").click();
      keydown(document.getElementById("t1"), "ArrowLeft");
      expect(document.getElementById("t0").getAttribute("aria-selected")).toBe(
        "true",
      );
    });

    it("ArrowRight wraps from the last tab to the first", async () => {
      await setup();
      document.getElementById("t2").click();
      keydown(document.getElementById("t2"), "ArrowRight");
      expect(document.getElementById("t0").getAttribute("aria-selected")).toBe(
        "true",
      );
    });

    it("ArrowLeft wraps from the first tab to the last", async () => {
      await setup();
      keydown(document.getElementById("t0"), "ArrowLeft");
      expect(document.getElementById("t2").getAttribute("aria-selected")).toBe(
        "true",
      );
    });

    it("Home moves to the first tab", async () => {
      await setup();
      document.getElementById("t2").click();
      keydown(document.getElementById("t2"), "Home");
      expect(document.getElementById("t0").getAttribute("aria-selected")).toBe(
        "true",
      );
    });

    it("End moves to the last tab", async () => {
      await setup();
      keydown(document.getElementById("t0"), "End");
      expect(document.getElementById("t2").getAttribute("aria-selected")).toBe(
        "true",
      );
    });

    it("ignores unrelated keys", async () => {
      await setup();
      keydown(document.getElementById("t0"), "Enter");
      expect(document.getElementById("t0").getAttribute("aria-selected")).toBe(
        "true",
      );
    });
  });

  describe("programmatic indexValue change", () => {
    it("switches the active tab when indexValue is set externally", async () => {
      await setup();
      const controller = application.getControllerForElementAndIdentifier(
        document.getElementById("widget"),
        "tabs",
      );
      controller.indexValue = 2;
      await tick();
      expect(document.getElementById("t2").getAttribute("aria-selected")).toBe(
        "true",
      );
      expect(document.getElementById("p2").hidden).toBe(false);
      expect(document.getElementById("p0").hidden).toBe(true);
    });
  });
});
