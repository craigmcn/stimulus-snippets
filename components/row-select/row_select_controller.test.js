import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import RowSelectController from "./row_select_controller";
import { getA11yViolations } from "../../test/axe";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("RowSelectController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("row-select", RowSelectController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await tick();
  }

  function rowCheckboxes() {
    return [...document.querySelectorAll('[data-row-select-target="row"]')];
  }

  function allCheckbox() {
    return document.querySelector('[data-row-select-target="all"]');
  }

  function bar() {
    return document.querySelector('[data-row-select-target="bar"]');
  }

  function count() {
    return document.querySelector('[data-row-select-target="count"]');
  }

  function basicTableHtml() {
    return `
      <div data-controller="row-select">
        <div data-row-select-target="bar" hidden>
          <span data-row-select-target="count"></span> selected
        </div>
        <table>
          <thead>
            <tr>
              <th>
                <input type="checkbox" data-row-select-target="all" data-action="change->row-select#toggleAll" aria-label="Select all rows" />
              </th>
              <th scope="col">Name</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="checkbox" data-row-select-target="row" data-action="click->row-select#toggle" aria-label="Select row" /></td>
              <td>Alice</td>
            </tr>
            <tr>
              <td><input type="checkbox" data-row-select-target="row" data-action="click->row-select#toggle" aria-label="Select row" /></td>
              <td>Bob</td>
            </tr>
            <tr>
              <td><input type="checkbox" data-row-select-target="row" data-action="click->row-select#toggle" aria-label="Select row" /></td>
              <td>Charlie</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  describe("connect", () => {
    it("starts with the bar hidden and count at zero", async () => {
      await setup(basicTableHtml());

      expect(bar().hidden).toBe(true);
      expect(count().textContent).toBe("0");
    });

    it("adds aria-live to the count target", async () => {
      await setup(basicTableHtml());

      expect(count().getAttribute("aria-live")).toBe("polite");
    });
  });

  describe("toggle", () => {
    it("shows the bar and updates the count when a row is checked", async () => {
      await setup(basicTableHtml());

      rowCheckboxes()[0].click();

      expect(bar().hidden).toBe(false);
      expect(count().textContent).toBe("1");
    });

    it("hides the bar again when the last row is unchecked", async () => {
      await setup(basicTableHtml());

      rowCheckboxes()[0].click();
      rowCheckboxes()[0].click();

      expect(bar().hidden).toBe(true);
      expect(count().textContent).toBe("0");
    });

    it("marks the selected row with data-row-select-selected", async () => {
      await setup(basicTableHtml());

      rowCheckboxes()[0].click();

      expect(
        rowCheckboxes()[0]
          .closest("tr")
          .hasAttribute("data-row-select-selected"),
      ).toBe(true);
      expect(
        rowCheckboxes()[1]
          .closest("tr")
          .hasAttribute("data-row-select-selected"),
      ).toBe(false);
    });

    it("sets the all checkbox to checked when every row is checked", async () => {
      await setup(basicTableHtml());

      rowCheckboxes().forEach((row) => row.click());

      expect(allCheckbox().checked).toBe(true);
      expect(allCheckbox().indeterminate).toBe(false);
    });

    it("sets the all checkbox to indeterminate when only some rows are checked", async () => {
      await setup(basicTableHtml());

      rowCheckboxes()[0].click();

      expect(allCheckbox().checked).toBe(false);
      expect(allCheckbox().indeterminate).toBe(true);
    });

    it("shift-clicking a row selects the range between it and the last clicked row", async () => {
      await setup(basicTableHtml());

      rowCheckboxes()[0].click();
      const event = new MouseEvent("click", {
        bubbles: true,
        shiftKey: true,
      });
      rowCheckboxes()[2].dispatchEvent(event);

      expect(rowCheckboxes().every((row) => row.checked)).toBe(true);
      expect(count().textContent).toBe("3");
    });

    it("shift-clicking a row to uncheck unchecks the whole range", async () => {
      await setup(basicTableHtml());

      rowCheckboxes().forEach((row) => row.click());

      rowCheckboxes()[0].click();
      const event = new MouseEvent("click", {
        bubbles: true,
        shiftKey: true,
      });
      rowCheckboxes()[2].dispatchEvent(event);

      expect(rowCheckboxes().every((row) => !row.checked)).toBe(true);
      expect(count().textContent).toBe("0");
    });

    it("does nothing when the click target isn't a row checkbox", async () => {
      await setup(basicTableHtml());

      document
        .querySelector("[data-controller]")
        .insertAdjacentHTML(
          "beforeend",
          '<input type="checkbox" data-action="click->row-select#toggle" />',
        );
      const outsider = document.querySelector(
        "[data-controller] > input[type=checkbox]",
      );

      expect(() => outsider.click()).not.toThrow();
      expect(rowCheckboxes().every((row) => !row.checked)).toBe(true);
      expect(count().textContent).toBe("0");
    });

    it("ignores a stale range anchor left behind by a row removed from the DOM", async () => {
      await setup(basicTableHtml());

      rowCheckboxes()[2].click();
      document.querySelector("tbody tr").remove();

      const event = new MouseEvent("click", {
        bubbles: true,
        shiftKey: true,
      });

      expect(() => rowCheckboxes()[1].dispatchEvent(event)).not.toThrow();
      expect(count().textContent).toBe("0");
    });
  });

  describe("toggleAll", () => {
    it("checks every row when the all checkbox is checked", async () => {
      await setup(basicTableHtml());

      allCheckbox().checked = true;
      allCheckbox().dispatchEvent(new Event("change"));

      expect(rowCheckboxes().every((row) => row.checked)).toBe(true);
      expect(count().textContent).toBe("3");
    });

    it("unchecks every row when the all checkbox is unchecked", async () => {
      await setup(basicTableHtml());

      allCheckbox().checked = true;
      allCheckbox().dispatchEvent(new Event("change"));
      allCheckbox().checked = false;
      allCheckbox().dispatchEvent(new Event("change"));

      expect(rowCheckboxes().every((row) => !row.checked)).toBe(true);
      expect(bar().hidden).toBe(true);
    });
  });

  describe("accessibility", () => {
    it("has no detectable accessibility violations using the documented usage example", async () => {
      await setup(basicTableHtml());

      const violations = await getA11yViolations(document.body);
      expect(violations).toEqual([]);
    });

    it("has no detectable accessibility violations after selecting rows", async () => {
      await setup(basicTableHtml());

      rowCheckboxes()[0].click();

      const violations = await getA11yViolations(document.body);
      expect(violations).toEqual([]);
    });
  });
});
