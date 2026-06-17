import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Application } from "@hotwired/stimulus";
import FormConfirmController from "./form_confirm_controller";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const FORM_HTML = `
  <div data-controller="form-confirm" data-form-confirm-message-value="Delete this post?">
    <form id="form" action="#" data-action="submit->form-confirm#intercept">
      <button type="submit">Delete</button>
    </form>

    <dialog data-form-confirm-target="dialog">
      <p data-form-confirm-target="message"></p>
      <button type="button" id="confirm-btn" data-action="click->form-confirm#proceed">
        Delete
      </button>
      <button type="button" id="cancel-btn" data-action="click->form-confirm#cancel">
        Cancel
      </button>
    </dialog>
  </div>
`;

const LINK_HTML = `
  <div data-controller="form-confirm">
    <a id="link" href="#" data-action="click->form-confirm#intercept">Remove</a>

    <dialog data-form-confirm-target="dialog">
      <button type="button" id="confirm-btn" data-action="click->form-confirm#proceed">
        Remove
      </button>
      <button type="button" id="cancel-btn" data-action="click->form-confirm#cancel">
        Cancel
      </button>
    </dialog>
  </div>
`;

describe("FormConfirmController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("form-confirm", FormConfirmController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await tick();
  }

  describe("form submission", () => {
    it("prevents the initial submit and opens the dialog", async () => {
      await setup(FORM_HTML);
      const form = document.getElementById("form");
      const submitSpy = vi.fn((e) => e.preventDefault());
      form.addEventListener("submit", submitSpy);

      document.getElementById("form").querySelector("button").click();

      expect(document.querySelector("dialog").open).toBe(true);
    });

    it("populates the message target from the message value", async () => {
      await setup(FORM_HTML);
      document.getElementById("form").querySelector("button").click();
      expect(document.querySelector("dialog p").textContent).toBe(
        "Delete this post?",
      );
    });

    it("resubmits the form and closes the dialog when proceed is clicked", async () => {
      await setup(FORM_HTML);
      const form = document.getElementById("form");
      let submitCount = 0;
      form.addEventListener("submit", (e) => {
        submitCount++;
        e.preventDefault();
      });

      form.querySelector("button").click();
      expect(submitCount).toBe(1);

      document.getElementById("confirm-btn").click();

      expect(submitCount).toBe(2);
      expect(document.querySelector("dialog").open).toBe(false);
    });

    it("does not resubmit the form when cancel is clicked", async () => {
      await setup(FORM_HTML);
      const form = document.getElementById("form");
      let submitCount = 0;
      form.addEventListener("submit", (e) => {
        submitCount++;
        e.preventDefault();
      });

      form.querySelector("button").click();
      expect(submitCount).toBe(1);

      document.getElementById("cancel-btn").click();

      expect(submitCount).toBe(1);
      expect(document.querySelector("dialog").open).toBe(false);
    });
  });

  describe("link interception", () => {
    it("prevents the initial click and opens the dialog", async () => {
      await setup(LINK_HTML);
      document.getElementById("link").click();
      expect(document.querySelector("dialog").open).toBe(true);
    });

    it("re-dispatches the click and closes the dialog when proceed is clicked", async () => {
      await setup(LINK_HTML);
      const link = document.getElementById("link");
      let clickCount = 0;
      link.addEventListener("click", () => clickCount++);

      link.click();
      expect(clickCount).toBe(1);

      document.getElementById("confirm-btn").click();

      expect(clickCount).toBe(2);
      expect(document.querySelector("dialog").open).toBe(false);
    });

    it("does not re-dispatch the click when cancel is clicked", async () => {
      await setup(LINK_HTML);
      const link = document.getElementById("link");
      let clickCount = 0;
      link.addEventListener("click", () => clickCount++);

      link.click();
      document.getElementById("cancel-btn").click();

      expect(clickCount).toBe(1);
      expect(document.querySelector("dialog").open).toBe(false);
    });
  });
});
