import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Application } from "@hotwired/stimulus";
import UnsavedChangesController from "./unsaved_changes_controller";
import { getA11yViolations } from "../../test/axe";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const FORM_HTML = `
  <form data-controller="unsaved-changes" data-unsaved-changes-message-value="Discard your edits?">
    <label for="title">Title</label>
    <input id="title" type="text" name="title" />
    <button type="submit">Save</button>
  </form>
`;

function dispatchBeforeUnload() {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

describe("UnsavedChangesController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("unsaved-changes", UnsavedChangesController);
  });

  afterEach(async () => {
    // This controller attaches listeners to window/document (not just its
    // own element), so disconnect() must actually run via the
    // MutationObserver noticing the element's removal before the
    // application is stopped — otherwise the observer is stopped first and
    // the listeners leak into the next test.
    document.body.innerHTML = "";
    await tick();
    application.stop();
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await tick();
  }

  it("does not warn on unload before any change", async () => {
    await setup(FORM_HTML);

    const event = dispatchBeforeUnload();

    expect(event.defaultPrevented).toBe(false);
  });

  it("warns on unload after an input change", async () => {
    await setup(FORM_HTML);
    const input = document.getElementById("title");

    input.value = "Hello";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    const event = dispatchBeforeUnload();

    expect(event.defaultPrevented).toBe(true);
  });

  it("warns on unload after a change event", async () => {
    await setup(FORM_HTML);
    const input = document.getElementById("title");

    input.dispatchEvent(new Event("change", { bubbles: true }));

    const event = dispatchBeforeUnload();

    expect(event.defaultPrevented).toBe(true);
  });

  it("clears the dirty state on submit", async () => {
    await setup(FORM_HTML);
    const form = document.querySelector("form");
    const input = document.getElementById("title");

    input.dispatchEvent(new Event("input", { bubbles: true }));
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    await tick();

    const event = dispatchBeforeUnload();

    expect(event.defaultPrevented).toBe(false);
  });

  it("does not clear the dirty state when another listener cancels the submit (e.g. form-confirm)", async () => {
    await setup(FORM_HTML);
    const form = document.querySelector("form");
    const input = document.getElementById("title");

    // Simulates a controller like form-confirm sharing the same submit
    // event and deferring the real submission behind a confirmation
    // dialog. Registered after unsaved-changes's own listener, the same
    // way a second data-controller token on the form would be.
    form.addEventListener("submit", (event) => event.preventDefault());

    input.dispatchEvent(new Event("input", { bubbles: true }));
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    await tick();

    const event = dispatchBeforeUnload();

    expect(event.defaultPrevented).toBe(true);
  });

  it("confirms before a Turbo visit when dirty, allowing the visit on confirm", async () => {
    await setup(FORM_HTML);
    const input = document.getElementById("title");
    input.dispatchEvent(new Event("input", { bubbles: true }));

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const event = new Event("turbo:before-visit", { cancelable: true });
    document.dispatchEvent(event);

    expect(confirmSpy).toHaveBeenCalledWith("Discard your edits?");
    expect(event.defaultPrevented).toBe(false);

    confirmSpy.mockRestore();
  });

  it("cancels a Turbo visit when dirty and the user declines", async () => {
    await setup(FORM_HTML);
    const input = document.getElementById("title");
    input.dispatchEvent(new Event("input", { bubbles: true }));

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    const event = new Event("turbo:before-visit", { cancelable: true });
    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);

    confirmSpy.mockRestore();
  });

  it("does not confirm a Turbo visit when not dirty", async () => {
    await setup(FORM_HTML);

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    const event = new Event("turbo:before-visit", { cancelable: true });
    document.dispatchEvent(event);

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);

    confirmSpy.mockRestore();
  });

  it("does not re-prompt a second dirty instance once an earlier one already cancelled the visit", async () => {
    await setup(`
      <form data-controller="unsaved-changes" data-unsaved-changes-message-value="Discard A?">
        <input id="title-a" type="text" name="title" />
      </form>
      <form data-controller="unsaved-changes" data-unsaved-changes-message-value="Discard B?">
        <input id="title-b" type="text" name="title" />
      </form>
    `);
    document
      .getElementById("title-a")
      .dispatchEvent(new Event("input", { bubbles: true }));
    document
      .getElementById("title-b")
      .dispatchEvent(new Event("input", { bubbles: true }));

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    const event = new Event("turbo:before-visit", { cancelable: true });
    document.dispatchEvent(event);

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);

    confirmSpy.mockRestore();
  });

  it("supports manually marking dirty/clean via public actions", async () => {
    await setup(FORM_HTML);
    const element = document.querySelector(
      '[data-controller="unsaved-changes"]',
    );
    const controller = application.getControllerForElementAndIdentifier(
      element,
      "unsaved-changes",
    );

    controller.markDirty();
    expect(dispatchBeforeUnload().defaultPrevented).toBe(true);

    controller.markClean();
    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });

  it("removes its listeners on disconnect", async () => {
    await setup(FORM_HTML);
    const input = document.getElementById("title");
    input.dispatchEvent(new Event("input", { bubbles: true }));

    document.querySelector("form").remove();
    await tick();

    const event = dispatchBeforeUnload();
    expect(event.defaultPrevented).toBe(false);
  });

  describe("accessibility", () => {
    it("has no violations in the default usage example", async () => {
      await setup(FORM_HTML);

      const violations = await getA11yViolations(
        document.querySelector("form"),
      );

      expect(violations).toEqual([]);
    });

    it("has no violations after a change is made", async () => {
      await setup(FORM_HTML);
      const input = document.getElementById("title");
      input.dispatchEvent(new Event("input", { bubbles: true }));

      const violations = await getA11yViolations(
        document.querySelector("form"),
      );

      expect(violations).toEqual([]);
    });
  });
});
