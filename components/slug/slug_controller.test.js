import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import SlugController, { toSlug } from "./slug_controller";
import { getA11yViolations } from "../../test/axe";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("toSlug", () => {
  it("lowercases the value", () => {
    expect(toSlug("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(toSlug("hello world")).toBe("hello-world");
  });

  it("collapses multiple spaces and special characters into one hyphen", () => {
    expect(toSlug("hello   world!")).toBe("hello-world");
  });

  it("strips diacritics", () => {
    expect(toSlug("café résumé")).toBe("cafe-resume");
  });

  it("trims leading and trailing hyphens", () => {
    expect(toSlug("  hello  ")).toBe("hello");
  });

  it("handles punctuation", () => {
    expect(toSlug("Hello, World!")).toBe("hello-world");
  });

  it("preserves numbers", () => {
    expect(toSlug("Post 42")).toBe("post-42");
  });

  it("returns an empty string for empty input", () => {
    expect(toSlug("")).toBe("");
  });

  it("returns an empty string for non-Latin scripts (CJK, Arabic, emoji)", () => {
    expect(toSlug("日本語")).toBe("");
    expect(toSlug("العربية")).toBe("");
    expect(toSlug("🎉")).toBe("");
  });
});

describe("SlugController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("slug", SlugController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await tick();
  }

  it("generates a slug from the source field on input", async () => {
    await setup(`
      <div data-controller="slug">
        <input id="source" data-slug-target="source" data-action="input->slug#generate">
        <input id="output" data-slug-target="output" data-action="input->slug#lock">
      </div>
    `);

    const source = document.getElementById("source");
    const output = document.getElementById("output");

    source.value = "Hello World";
    source.dispatchEvent(new Event("input"));

    expect(output.value).toBe("hello-world");
  });

  it("stops generating after the user edits the output field", async () => {
    await setup(`
      <div data-controller="slug">
        <input id="source" data-slug-target="source" data-action="input->slug#generate">
        <input id="output" data-slug-target="output" data-action="input->slug#lock">
      </div>
    `);

    const source = document.getElementById("source");
    const output = document.getElementById("output");

    output.value = "my-custom-slug";
    output.dispatchEvent(new Event("input"));

    source.value = "Something Else";
    source.dispatchEvent(new Event("input"));

    expect(output.value).toBe("my-custom-slug");
  });

  it("starts locked when the output already has a value on connect", async () => {
    await setup(`
      <div data-controller="slug">
        <input id="source" data-slug-target="source" data-action="input->slug#generate">
        <input id="output" data-slug-target="output" data-action="input->slug#lock" value="existing-slug">
      </div>
    `);

    const source = document.getElementById("source");
    const output = document.getElementById("output");

    source.value = "New Title";
    source.dispatchEvent(new Event("input"));

    expect(output.value).toBe("existing-slug");
  });

  it("remains locked through a reconnect even when the output is empty", async () => {
    await setup(`
      <div data-controller="slug">
        <input id="source" data-slug-target="source" data-action="input->slug#generate">
        <input id="output" data-slug-target="output" data-action="input->slug#lock">
      </div>
    `);

    const source = document.getElementById("source");
    const output = document.getElementById("output");
    const el = document.querySelector("[data-controller='slug']");

    output.value = "my-custom-slug";
    output.dispatchEvent(new Event("input"));

    // Simulate reconnect with output cleared (e.g. Turbo morph)
    el.removeAttribute("data-controller");
    await tick();
    output.value = "";
    el.setAttribute("data-controller", "slug");
    await tick();

    source.value = "New Title";
    source.dispatchEvent(new Event("input"));

    expect(output.value).toBe("");
  });

  describe("accessibility", () => {
    it("has no detectable accessibility violations using the documented usage example", async () => {
      await setup(`
        <div id="widget" data-controller="slug">
          <div>
            <label for="post_title">Title</label>
            <input id="post_title" type="text" name="post[title]" data-slug-target="source" data-action="input->slug#generate">
          </div>
          <div>
            <label for="post_slug">Slug</label>
            <input id="post_slug" type="text" name="post[slug]" data-slug-target="output" data-action="input->slug#lock">
          </div>
        </div>
      `);
      const violations = await getA11yViolations(
        document.getElementById("widget"),
      );
      expect(violations).toEqual([]);
    });
  });
});
