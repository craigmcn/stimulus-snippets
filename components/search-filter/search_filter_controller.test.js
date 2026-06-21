import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import SearchFilterController from "./search_filter_controller";
import { getA11yViolations } from "../../test/axe";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("SearchFilterController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("search-filter", SearchFilterController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await tick();
  }

  function baseHtml(extra = "") {
    return `
      <div data-controller="search-filter">
        <input
          id="input"
          data-search-filter-target="input"
          data-action="input->search-filter#filter"
        />
        <ul>
          <li id="apple" data-search-filter-target="item">Apple</li>
          <li id="banana" data-search-filter-target="item">Banana</li>
          <li id="cherry" data-search-filter-target="item">Cherry</li>
        </ul>
        ${extra}
      </div>
    `;
  }

  function filterFor(value) {
    const input = document.getElementById("input");
    input.value = value;
    input.dispatchEvent(new Event("input"));
  }

  describe("connect", () => {
    it("shows all items when the input is empty", async () => {
      await setup(baseHtml());

      expect(document.getElementById("apple").hidden).toBe(false);
      expect(document.getElementById("banana").hidden).toBe(false);
      expect(document.getElementById("cherry").hidden).toBe(false);
    });

    it("applies an existing input value on connect", async () => {
      await setup(baseHtml().replace('id="input"', 'id="input" value="ban"'));

      expect(document.getElementById("apple").hidden).toBe(true);
      expect(document.getElementById("banana").hidden).toBe(false);
    });

    it("adds aria-live to the empty target", async () => {
      await setup(
        baseHtml(
          '<p id="empty" data-search-filter-target="empty" hidden>No results</p>',
        ),
      );

      expect(document.getElementById("empty").getAttribute("aria-live")).toBe(
        "polite",
      );
    });

    it("does not override an existing aria-live on empty", async () => {
      await setup(
        baseHtml(
          '<p id="empty" data-search-filter-target="empty" aria-live="assertive" hidden>No results</p>',
        ),
      );

      expect(document.getElementById("empty").getAttribute("aria-live")).toBe(
        "assertive",
      );
    });
  });

  describe("filter", () => {
    it("hides items that do not match the query", async () => {
      await setup(baseHtml());

      filterFor("an");

      expect(document.getElementById("apple").hidden).toBe(true);
      expect(document.getElementById("banana").hidden).toBe(false);
      expect(document.getElementById("cherry").hidden).toBe(true);
    });

    it("is case-insensitive", async () => {
      await setup(baseHtml());

      filterFor("APPLE");

      expect(document.getElementById("apple").hidden).toBe(false);
      expect(document.getElementById("banana").hidden).toBe(true);
    });

    it("shows all items again when the query is cleared", async () => {
      await setup(baseHtml());

      filterFor("apple");
      filterFor("");

      expect(document.getElementById("apple").hidden).toBe(false);
      expect(document.getElementById("banana").hidden).toBe(false);
      expect(document.getElementById("cherry").hidden).toBe(false);
    });

    it("trims whitespace from the query", async () => {
      await setup(baseHtml());

      filterFor("  apple  ");

      expect(document.getElementById("apple").hidden).toBe(false);
      expect(document.getElementById("banana").hidden).toBe(true);
    });

    it("matches against a data-search-filter-term override instead of textContent", async () => {
      await setup(
        baseHtml().replace(
          '<li id="apple" data-search-filter-target="item">Apple</li>',
          '<li id="apple" data-search-filter-target="item" data-search-filter-term="fruit apple pome">Apple</li>',
        ),
      );

      filterFor("pome");

      expect(document.getElementById("apple").hidden).toBe(false);
      expect(document.getElementById("banana").hidden).toBe(true);
    });

    it("shows the empty target when no items match", async () => {
      await setup(
        baseHtml(
          '<p id="empty" data-search-filter-target="empty" hidden>No results</p>',
        ),
      );

      filterFor("xyz");

      expect(document.getElementById("empty").hidden).toBe(false);
    });

    it("hides the empty target when at least one item matches", async () => {
      await setup(
        baseHtml(
          '<p id="empty" data-search-filter-target="empty">No results</p>',
        ),
      );

      filterFor("apple");

      expect(document.getElementById("empty").hidden).toBe(true);
    });
  });

  describe("accessibility", () => {
    const A11Y_HTML = `
      <div id="widget" data-controller="search-filter">
        <label for="input">Filter fruits</label>
        <input
          id="input"
          type="search"
          data-search-filter-target="input"
          data-action="input->search-filter#filter"
        />
        <ul>
          <li data-search-filter-target="item">Apple</li>
          <li data-search-filter-target="item">Banana</li>
          <li data-search-filter-target="item">Cherry</li>
        </ul>
        <p data-search-filter-target="empty" hidden>No fruits match your search.</p>
      </div>
    `;

    it("has no detectable accessibility violations using the documented usage example", async () => {
      await setup(A11Y_HTML);
      const violations = await getA11yViolations(
        document.getElementById("widget"),
      );
      expect(violations).toEqual([]);
    });

    it("has no detectable accessibility violations once the empty target is shown", async () => {
      await setup(A11Y_HTML);
      filterFor("xyz");
      const violations = await getA11yViolations(
        document.getElementById("widget"),
      );
      expect(violations).toEqual([]);
    });
  });
});
