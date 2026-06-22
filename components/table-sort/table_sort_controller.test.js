import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import TableSortController from "./table_sort_controller";
import { getA11yViolations } from "../../test/axe";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("TableSortController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("table-sort", TableSortController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await tick();
  }

  function header(label) {
    return [...document.querySelectorAll("button")].find(
      (button) => button.textContent === label,
    );
  }

  function bodyText() {
    return [...document.querySelectorAll("tbody tr")].map(
      (row) => row.cells[0].textContent,
    );
  }

  function basicTableHtml() {
    return `
      <table data-controller="table-sort">
        <thead>
          <tr>
            <th scope="col"><button type="button" data-table-sort-target="header" data-action="click->table-sort#sort">Name</button></th>
            <th scope="col"><button type="button" data-table-sort-target="header" data-action="click->table-sort#sort">Age</button></th>
          </tr>
        </thead>
        <tbody>
          <tr data-table-sort-target="row"><td>Charlie</td><td>40</td></tr>
          <tr data-table-sort-target="row"><td>Alice</td><td>30</td></tr>
          <tr data-table-sort-target="row"><td>Bob</td><td>25</td></tr>
        </tbody>
      </table>
    `;
  }

  describe("connect", () => {
    it("sets aria-sort=none on every sortable header", async () => {
      await setup(basicTableHtml());

      expect(header("Name").closest("th").getAttribute("aria-sort")).toBe(
        "none",
      );
      expect(header("Age").closest("th").getAttribute("aria-sort")).toBe(
        "none",
      );
    });
  });

  describe("sort", () => {
    it("sorts a string column ascending on first click", async () => {
      await setup(basicTableHtml());

      header("Name").click();

      expect(bodyText()).toEqual(["Alice", "Bob", "Charlie"]);
      expect(header("Name").closest("th").getAttribute("aria-sort")).toBe(
        "ascending",
      );
    });

    it("sorts descending on a second click of the same header", async () => {
      await setup(basicTableHtml());

      header("Name").click();
      header("Name").click();

      expect(bodyText()).toEqual(["Charlie", "Bob", "Alice"]);
      expect(header("Name").closest("th").getAttribute("aria-sort")).toBe(
        "descending",
      );
    });

    it("auto-detects and sorts a numeric column", async () => {
      await setup(basicTableHtml());

      header("Age").click();

      expect(bodyText()).toEqual(["Bob", "Alice", "Charlie"]);
    });

    it("resets aria-sort on the previously sorted header when a new column is sorted", async () => {
      await setup(basicTableHtml());

      header("Name").click();
      header("Age").click();

      expect(header("Name").closest("th").getAttribute("aria-sort")).toBe(
        "none",
      );
      expect(header("Age").closest("th").getAttribute("aria-sort")).toBe(
        "ascending",
      );
    });

    it("respects an explicit data-table-sort-type override when the first row misleads auto-detection", async () => {
      await setup(`
        <table data-controller="table-sort">
          <thead>
            <tr>
              <th scope="col"><button type="button" data-table-sort-target="header" data-table-sort-type="number" data-action="click->table-sort#sort">Score</button></th>
            </tr>
          </thead>
          <tbody>
            <tr data-table-sort-target="row"><td>N/A</td></tr>
            <tr data-table-sort-target="row"><td>30</td></tr>
            <tr data-table-sort-target="row"><td>5</td></tr>
          </tbody>
        </table>
      `);

      header("Score").click();

      expect(bodyText()).toEqual(["N/A", "5", "30"]);
    });

    it("sorts using data-table-sort-value as the comparison key over displayed text", async () => {
      await setup(`
        <table data-controller="table-sort">
          <thead>
            <tr>
              <th scope="col"><button type="button" data-table-sort-target="header" data-table-sort-type="number" data-action="click->table-sort#sort">Joined</button></th>
            </tr>
          </thead>
          <tbody>
            <tr data-table-sort-target="row"><td data-table-sort-value="3">March</td></tr>
            <tr data-table-sort-target="row"><td data-table-sort-value="1">January</td></tr>
            <tr data-table-sort-target="row"><td data-table-sort-value="2">February</td></tr>
          </tbody>
        </table>
      `);

      header("Joined").click();

      expect(bodyText()).toEqual(["January", "February", "March"]);
    });
  });

  describe("accessibility", () => {
    it("has no detectable accessibility violations using the documented usage example", async () => {
      await setup(basicTableHtml());
      const violations = await getA11yViolations(
        document.querySelector("table"),
      );
      expect(violations).toEqual([]);
    });

    it("has no detectable accessibility violations after sorting", async () => {
      await setup(basicTableHtml());
      header("Name").click();
      const violations = await getA11yViolations(
        document.querySelector("table"),
      );
      expect(violations).toEqual([]);
    });
  });
});
