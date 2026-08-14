import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import ResponsiveDisableController from "./responsive_disable_controller";
import { getA11yViolations } from "../../test/axe";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

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
  <div class="d-none d-md-block">
    <label for="promo">Promo code</label>
    <input
      id="promo"
      type="text"
      name="promo"
      data-controller="responsive-disable"
      data-responsive-disable-target="field"
    />
  </div>
`;

describe("ResponsiveDisableController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("responsive-disable", ResponsiveDisableController);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    application.stop();
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await tick();
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

  it("disables the field once it's hidden by a resize", async () => {
    await setup(SELF_HTML);
    const field = document.getElementById("promo");

    field.style.display = "none";
    dispatchResize();

    expect(field.disabled).toBe(true);
  });

  it("re-enables the field once it's visible again after a resize", async () => {
    await setup(SELF_HTML);
    const field = document.getElementById("promo");

    field.style.display = "none";
    dispatchResize();
    expect(field.disabled).toBe(true);

    field.style.display = "";
    dispatchResize();
    expect(field.disabled).toBe(false);
  });

  it("detects visibility hidden by an ancestor wrapper, not just the field itself", async () => {
    await setup(WRAPPER_HTML);
    const field = document.getElementById("promo");
    const wrapper = document.querySelector(".d-none");

    wrapper.style.display = "none";
    dispatchResize();
    expect(field.disabled).toBe(true);

    wrapper.style.display = "";
    dispatchResize();
    expect(field.disabled).toBe(false);
  });

  it("removes its resize listener on disconnect", async () => {
    await setup(SELF_HTML);
    const field = document.getElementById("promo");

    document.body.innerHTML = "";
    await tick();

    field.style.display = "none";
    dispatchResize();

    expect(field.disabled).toBe(false);
  });

  describe("accessibility", () => {
    it("has no violations when the field is visible", async () => {
      await setup(SELF_HTML);

      const violations = await getA11yViolations(document.body);

      expect(violations).toEqual([]);
    });

    it("has no violations when the field is hidden and disabled", async () => {
      await setup(SELF_HTML);
      const field = document.getElementById("promo");

      field.style.display = "none";
      dispatchResize();

      const violations = await getA11yViolations(document.body);

      expect(violations).toEqual([]);
    });
  });
});
