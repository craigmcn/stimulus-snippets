import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import DirectUploadProgressController from "./direct_upload_progress_controller";
import { getA11yViolations } from "../../test/axe";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const DEFAULT_HTML = `
  <div data-controller="direct-upload-progress">
    <input
      type="file"
      multiple
      data-direct-upload-url="/rails/active_storage/direct_uploads"
      data-action="
        direct-upload:initialize->direct-upload-progress#add
        direct-upload:progress->direct-upload-progress#progress
        direct-upload:error->direct-upload-progress#error
        direct-upload:end->direct-upload-progress#end
      "
    />
    <ul data-direct-upload-progress-target="list"></ul>
    <p data-direct-upload-progress-target="status"></p>
  </div>
`;

const A11Y_HTML = `
  <div id="widget" data-controller="direct-upload-progress">
    <label for="file">Attachments</label>
    <input
      id="file"
      type="file"
      multiple
      data-direct-upload-url="/rails/active_storage/direct_uploads"
      data-action="
        direct-upload:initialize->direct-upload-progress#add
        direct-upload:progress->direct-upload-progress#progress
        direct-upload:error->direct-upload-progress#error
        direct-upload:end->direct-upload-progress#end
      "
    />
    <ul data-direct-upload-progress-target="list"></ul>
    <p data-direct-upload-progress-target="status"></p>
  </div>
`;

describe("DirectUploadProgressController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register(
      "direct-upload-progress",
      DirectUploadProgressController,
    );
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(html = DEFAULT_HTML) {
    document.body.innerHTML = html;
    await tick();
  }

  function dispatch(name, detail) {
    const input = document.querySelector("input[type=file]");
    input.dispatchEvent(
      new CustomEvent(name, { detail, bubbles: true, cancelable: true }),
    );
  }

  function file(name = "photo.png") {
    return new File(["x"], name, { type: "image/png" });
  }

  describe("add", () => {
    it("adds a list item with the file name and a progress element", async () => {
      await setup();
      dispatch("direct-upload:initialize", { id: 1, file: file("a.png") });

      const item = document.querySelector("li");
      expect(item.dataset.directUploadProgressState).toBe("uploading");
      expect(item.textContent).toContain("a.png");
      expect(item.querySelector("progress")).not.toBeNull();
    });

    it("supports multiple concurrent uploads", async () => {
      await setup();
      dispatch("direct-upload:initialize", { id: 1, file: file("a.png") });
      dispatch("direct-upload:initialize", { id: 2, file: file("b.png") });

      expect(document.querySelectorAll("li")).toHaveLength(2);
    });
  });

  describe("progress", () => {
    it("updates the progress element's value", async () => {
      await setup();
      dispatch("direct-upload:initialize", { id: 1, file: file() });
      dispatch("direct-upload:progress", { id: 1, progress: 42 });

      expect(document.querySelector("progress").value).toBe(42);
    });

    it("ignores progress for an unknown id", async () => {
      await setup();
      expect(() =>
        dispatch("direct-upload:progress", { id: 99, progress: 50 }),
      ).not.toThrow();
    });
  });

  describe("error", () => {
    it("marks the item as errored", async () => {
      await setup();
      dispatch("direct-upload:initialize", { id: 1, file: file() });
      dispatch("direct-upload:error", { id: 1, error: "Upload failed" });

      expect(
        document.querySelector("li").dataset.directUploadProgressState,
      ).toBe("error");
    });

    it("announces the failure via the status target", async () => {
      await setup();
      dispatch("direct-upload:initialize", { id: 1, file: file("a.png") });
      dispatch("direct-upload:error", { id: 1, error: "Upload failed" });

      expect(document.querySelector("p").textContent).toBe(
        "a.png failed: Upload failed",
      );
    });

    it("ignores a late progress event for the same id after erroring", async () => {
      await setup();
      dispatch("direct-upload:initialize", { id: 1, file: file() });
      dispatch("direct-upload:progress", { id: 1, progress: 30 });
      dispatch("direct-upload:error", { id: 1, error: "Upload failed" });
      dispatch("direct-upload:progress", { id: 1, progress: 80 });

      expect(document.querySelector("progress").value).toBe(30);
    });
  });

  describe("end", () => {
    it("marks a successful upload as done and sets progress to 100", async () => {
      await setup();
      dispatch("direct-upload:initialize", { id: 1, file: file() });
      dispatch("direct-upload:end", { id: 1 });

      expect(
        document.querySelector("li").dataset.directUploadProgressState,
      ).toBe("done");
      expect(document.querySelector("progress").value).toBe(100);
    });

    it("leaves an errored item as errored instead of overwriting it with done", async () => {
      await setup();
      dispatch("direct-upload:initialize", { id: 1, file: file() });
      dispatch("direct-upload:error", { id: 1, error: "Upload failed" });
      dispatch("direct-upload:end", { id: 1 });

      expect(
        document.querySelector("li").dataset.directUploadProgressState,
      ).toBe("error");
    });

    it("ignores end for an unknown id", async () => {
      await setup();
      expect(() => dispatch("direct-upload:end", { id: 99 })).not.toThrow();
    });

    it("ignores a late progress event for the same id after ending", async () => {
      await setup();
      dispatch("direct-upload:initialize", { id: 1, file: file() });
      dispatch("direct-upload:end", { id: 1 });
      dispatch("direct-upload:progress", { id: 1, progress: 50 });

      expect(document.querySelector("progress").value).toBe(100);
    });
  });

  describe("status target", () => {
    it("auto-applies aria-live polite when not already set", async () => {
      await setup();
      expect(document.querySelector("p").getAttribute("aria-live")).toBe(
        "polite",
      );
    });

    it("does not override an author-provided aria-live value", async () => {
      await setup(`
        <div data-controller="direct-upload-progress">
          <input type="file" data-direct-upload-url="/uploads" />
          <ul data-direct-upload-progress-target="list"></ul>
          <p data-direct-upload-progress-target="status" aria-live="assertive"></p>
        </div>
      `);
      expect(document.querySelector("p").getAttribute("aria-live")).toBe(
        "assertive",
      );
    });
  });

  it("works without a status target", async () => {
    await setup(`
      <div data-controller="direct-upload-progress">
        <input type="file" data-direct-upload-url="/uploads" />
        <ul data-direct-upload-progress-target="list"></ul>
      </div>
    `);
    expect(() =>
      dispatch("direct-upload:initialize", { id: 1, file: file() }),
    ).not.toThrow();
  });

  describe("accessibility", () => {
    it("has no detectable accessibility violations while idle", async () => {
      await setup(A11Y_HTML);
      const violations = await getA11yViolations(
        document.getElementById("widget"),
      );
      expect(violations).toEqual([]);
    });

    it("has no detectable accessibility violations mid-upload", async () => {
      await setup(A11Y_HTML);
      dispatch("direct-upload:initialize", { id: 1, file: file("a.png") });
      dispatch("direct-upload:progress", { id: 1, progress: 50 });

      const violations = await getA11yViolations(
        document.getElementById("widget"),
      );
      expect(violations).toEqual([]);
    });
  });
});
