import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import FilePreviewController from "./file_preview_controller";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("FilePreviewController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("file-preview", FilePreviewController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(extra = "") {
    document.body.innerHTML = `
      <div data-controller="file-preview">
        <input
          type="file"
          multiple
          data-file-preview-target="input"
          data-action="change->file-preview#preview"
        />
        <ul data-file-preview-target="list"></ul>
        ${extra}
      </div>
    `;
    await tick();
  }

  function selectFiles(files) {
    const input = document.querySelector("input");
    Object.defineProperty(input, "files", { value: files, configurable: true });
    input.dispatchEvent(new Event("change"));
  }

  describe("connect", () => {
    it("renders nothing when no file is selected", async () => {
      await setup();

      expect(document.querySelectorAll("li")).toHaveLength(0);
    });

    it("shows the empty target when no file is selected", async () => {
      await setup('<p data-file-preview-target="empty">No files chosen</p>');

      expect(document.querySelector("p").hidden).toBe(false);
    });
  });

  describe("preview", () => {
    it("renders one item per selected file", async () => {
      await setup();

      selectFiles([
        new File(["a"], "a.txt", { type: "text/plain" }),
        new File(["b"], "b.png", { type: "image/png" }),
      ]);

      expect(document.querySelectorAll("li")).toHaveLength(2);
    });

    it("renders an image thumbnail for image files", async () => {
      await setup();

      selectFiles([new File(["a"], "a.png", { type: "image/png" })]);

      const item = document.querySelector("li");
      expect(item.dataset.filePreviewType).toBe("image");
      expect(item.querySelector("img")).not.toBeNull();
      expect(item.querySelector("img").alt).toBe("");
    });

    it("does not render a thumbnail for non-image files", async () => {
      await setup();

      selectFiles([new File(["a"], "a.txt", { type: "text/plain" })]);

      const item = document.querySelector("li");
      expect(item.dataset.filePreviewType).toBe("file");
      expect(item.querySelector("img")).toBeNull();
    });

    it("shows the file name and a human-readable size", async () => {
      await setup();

      selectFiles([
        new File(["x".repeat(2048)], "a.txt", { type: "text/plain" }),
      ]);

      const item = document.querySelector("li");
      expect(
        item.querySelector('[data-file-preview-role="name"]').textContent,
      ).toBe("a.txt");
      expect(
        item.querySelector('[data-file-preview-role="size"]').textContent,
      ).toBe("2.0 KB");
    });

    it("formats sizes under 1024 bytes in bytes", async () => {
      await setup();

      selectFiles([new File(["x".repeat(10)], "a.txt")]);

      expect(
        document.querySelector('[data-file-preview-role="size"]').textContent,
      ).toBe("10 B");
    });

    it("hides the empty target once a file is selected", async () => {
      await setup('<p data-file-preview-target="empty">No files chosen</p>');

      selectFiles([new File(["a"], "a.txt")]);

      expect(document.querySelector("p").hidden).toBe(true);
    });

    it("re-renders and shows the empty target again when files are cleared", async () => {
      await setup('<p data-file-preview-target="empty">No files chosen</p>');

      selectFiles([new File(["a"], "a.txt")]);
      selectFiles([]);

      expect(document.querySelectorAll("li")).toHaveLength(0);
      expect(document.querySelector("p").hidden).toBe(false);
    });
  });

  describe("clear", () => {
    it("resets the input value and clears the preview list", async () => {
      await setup();

      selectFiles([new File(["a"], "a.txt")]);
      expect(document.querySelectorAll("li")).toHaveLength(1);

      const input = document.querySelector("input");
      Object.defineProperty(input, "files", { value: [], configurable: true });
      application
        .getControllerForElementAndIdentifier(
          document.querySelector("[data-controller]"),
          "file-preview",
        )
        .clear();

      expect(input.value).toBe("");
      expect(document.querySelectorAll("li")).toHaveLength(0);
    });
  });
});
