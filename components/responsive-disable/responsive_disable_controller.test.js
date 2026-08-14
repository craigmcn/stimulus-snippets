import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Application } from "@hotwired/stimulus";
import ResponsiveDisableController from "./responsive_disable_controller";
import { getA11yViolations } from "../../test/axe";

function dispatchResize() {
  window.dispatchEvent(new Event("resize"));
}

const SELF_HTML = `
  <label for="promo">Promo code</label>
  <input
    id="promo"
    type="text"
    name="promo"
    data-controller="responsive-disable"
  />
`;

const WRAPPER_HTML = `
  <div class="d-none d-md-block" data-controller="responsive-disable">
    <label for="promo">Promo code</label>
    <input
      id="promo"
      type="text"
      name="promo"
      data-responsive-disable-target="field"
    />
  </div>
`;

describe("ResponsiveDisableController", () => {
  let application;

  beforeEach(() => {
    vi.useFakeTimers();
    application = Application.start();
    application.register("responsive-disable", ResponsiveDisableController);
  });

  afterEach(async () => {
    document.body.innerHTML = "";
    if (vi.isFakeTimers()) {
      await vi.advanceTimersByTimeAsync(0);
    }
    application.stop();
    vi.useRealTimers();
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await vi.advanceTimersByTimeAsync(0);
  }

  it("leaves a visible field enabled", async () => {
    await setup(SELF_HTML);

    expect(document.getElementById("promo").disabled).toBe(false);
  });

  it("disables the field on connect when it starts hidden, without waiting for a resize", async () => {
    await setup(`
      <label for="promo">Promo code</label>
      <input
        id="promo"
        type="text"
        name="promo"
        style="display: none"
        data-controller="responsive-disable"
      />
    `);

    expect(document.getElementById("promo").disabled).toBe(true);
  });

  it("disables the field once it's hidden by a resize, after the debounce delay", async () => {
    await setup(SELF_HTML);
    const field = document.getElementById("promo");

    field.style.display = "none";
    dispatchResize();
    expect(field.disabled).toBe(false);

    await vi.advanceTimersByTimeAsync(150);

    expect(field.disabled).toBe(true);
  });

  it("re-enables the field once it's visible again after a resize", async () => {
    await setup(SELF_HTML);
    const field = document.getElementById("promo");

    field.style.display = "none";
    dispatchResize();
    await vi.advanceTimersByTimeAsync(150);
    expect(field.disabled).toBe(true);

    field.style.display = "";
    dispatchResize();
    await vi.advanceTimersByTimeAsync(150);
    expect(field.disabled).toBe(false);
  });

  it("collapses rapid resize events into a single sync after the debounce delay", async () => {
    await setup(SELF_HTML);
    const field = document.getElementById("promo");

    field.style.display = "none";
    dispatchResize();
    await vi.advanceTimersByTimeAsync(50);
    dispatchResize();
    await vi.advanceTimersByTimeAsync(50);
    dispatchResize();
    await vi.advanceTimersByTimeAsync(50);
    expect(field.disabled).toBe(false);

    await vi.advanceTimersByTimeAsync(100);
    expect(field.disabled).toBe(true);
  });

  it("honors a custom delay value", async () => {
    await setup(`
      <label for="promo">Promo code</label>
      <input
        id="promo"
        type="text"
        name="promo"
        data-controller="responsive-disable"
        data-responsive-disable-delay-value="500"
      />
    `);
    const field = document.getElementById("promo");

    field.style.display = "none";
    dispatchResize();
    await vi.advanceTimersByTimeAsync(150);
    expect(field.disabled).toBe(false);

    await vi.advanceTimersByTimeAsync(350);
    expect(field.disabled).toBe(true);
  });

  it("detects visibility hidden by an ancestor wrapper, not just the field itself", async () => {
    await setup(WRAPPER_HTML);
    const field = document.getElementById("promo");
    const wrapper = document.querySelector(".d-none");

    wrapper.style.display = "none";
    dispatchResize();
    await vi.advanceTimersByTimeAsync(150);
    expect(field.disabled).toBe(true);

    wrapper.style.display = "";
    dispatchResize();
    await vi.advanceTimersByTimeAsync(150);
    expect(field.disabled).toBe(false);
  });

  it("stops checking visibility at the controller's own element, ignoring hidden ancestors outside it", async () => {
    await setup(`
      <div id="collapsible" style="display: none">
        ${WRAPPER_HTML}
      </div>
    `);
    const field = document.getElementById("promo");

    expect(field.disabled).toBe(false);
  });

  it("warns and does not attempt to disable a non-form-control element when the field target is missing", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await setup(`
      <div class="d-none d-md-block" data-controller="responsive-disable">
        <label for="promo">Promo code</label>
        <input id="promo" type="text" name="promo" />
      </div>
    `);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("does not support the disabled attribute"),
    );
    expect(document.getElementById("promo").disabled).toBe(false);

    warnSpy.mockRestore();
  });

  it("removes its resize listener on disconnect", async () => {
    await setup(SELF_HTML);
    const field = document.getElementById("promo");

    document.body.innerHTML = "";
    await vi.advanceTimersByTimeAsync(0);

    field.style.display = "none";
    dispatchResize();
    await vi.advanceTimersByTimeAsync(150);

    expect(field.disabled).toBe(false);
  });

  it("cancels a pending debounced sync on disconnect", async () => {
    await setup(SELF_HTML);
    const field = document.getElementById("promo");

    field.style.display = "none";
    dispatchResize();

    document.body.innerHTML = "";
    await vi.advanceTimersByTimeAsync(150);

    expect(field.disabled).toBe(false);
  });

  it("keeps same-name fields in sync when one is edited", async () => {
    await setup(`
      <input
        id="promo-desktop"
        type="text"
        name="promo"
        class="d-none d-md-block"
        data-controller="responsive-disable"
      />
      <input id="promo-mobile" type="text" name="promo" class="d-md-none" />
    `);

    const desktop = document.getElementById("promo-desktop");
    const mobile = document.getElementById("promo-mobile");

    desktop.value = "SAVE10";
    desktop.dispatchEvent(new Event("input", { bubbles: true }));

    expect(mobile.value).toBe("SAVE10");
  });

  it("only syncs fields sharing the same name within the closest form", async () => {
    await setup(`
      <form id="form-a">
        <input
          id="a-promo"
          type="text"
          name="promo"
          data-controller="responsive-disable"
        />
      </form>
      <form id="form-b">
        <input id="b-promo" type="text" name="promo" />
      </form>
    `);

    const fieldA = document.getElementById("a-promo");
    const fieldB = document.getElementById("b-promo");

    fieldA.value = "SAVE10";
    fieldA.dispatchEvent(new Event("input", { bubbles: true }));

    expect(fieldB.value).toBe("");
  });

  describe("accessibility", () => {
    it("has no violations when the field is visible", async () => {
      await setup(SELF_HTML);

      vi.useRealTimers();
      const violations = await getA11yViolations(document.body);

      expect(violations).toEqual([]);
    });

    it("has no violations when the field is hidden and disabled", async () => {
      await setup(SELF_HTML);
      const field = document.getElementById("promo");

      field.style.display = "none";
      dispatchResize();
      await vi.advanceTimersByTimeAsync(150);

      vi.useRealTimers();
      const violations = await getA11yViolations(document.body);

      expect(violations).toEqual([]);
    });
  });
});
