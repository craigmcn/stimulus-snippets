import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import DependentSelectController from "./dependent_select_controller";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("DependentSelectController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("dependent-select", DependentSelectController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await tick();
  }

  function baseHtml({ countryValue = "", stateValue = "" } = {}) {
    return `
      <div data-controller="dependent-select">
        <select
          id="country"
          data-dependent-select-target="group"
          data-action="change->dependent-select#filter"
        >
          <option value="">Choose a country</option>
          <option value="US" ${countryValue === "US" ? "selected" : ""}>United States</option>
          <option value="CA" ${countryValue === "CA" ? "selected" : ""}>Canada</option>
        </select>

        <select id="state" data-dependent-select-target="dependent">
          <option value="">Choose a state</option>
          <option value="CA-state" data-dependent-select-group="US" ${stateValue === "CA-state" ? "selected" : ""}>California</option>
          <option value="NY" data-dependent-select-group="US" ${stateValue === "NY" ? "selected" : ""}>New York</option>
          <option value="ON" data-dependent-select-group="CA" ${stateValue === "ON" ? "selected" : ""}>Ontario</option>
          <option value="QC" data-dependent-select-group="CA" ${stateValue === "QC" ? "selected" : ""}>Quebec</option>
        </select>
      </div>
    `;
  }

  function selectCountry(value) {
    const select = document.getElementById("country");
    select.value = value;
    select.dispatchEvent(new Event("change"));
  }

  function optionsFor(group) {
    return Array.from(document.getElementById("state").options).filter(
      (option) => option.dataset.dependentSelectGroup === group,
    );
  }

  describe("connect", () => {
    it("hides and disables every grouped option when no group is selected", async () => {
      await setup(baseHtml());

      optionsFor("US")
        .concat(optionsFor("CA"))
        .forEach((option) => {
          expect(option.hidden).toBe(true);
          expect(option.disabled).toBe(true);
        });
    });

    it("does not hide the placeholder option", async () => {
      await setup(baseHtml());

      const placeholder = document.getElementById("state").options[0];
      expect(placeholder.hidden).toBe(false);
      expect(placeholder.disabled).toBe(false);
    });

    it("applies an existing group selection on connect", async () => {
      await setup(baseHtml({ countryValue: "US", stateValue: "NY" }));

      optionsFor("US").forEach((option) => {
        expect(option.hidden).toBe(false);
        expect(option.disabled).toBe(false);
      });
      optionsFor("CA").forEach((option) => {
        expect(option.hidden).toBe(true);
        expect(option.disabled).toBe(true);
      });
      expect(document.getElementById("state").value).toBe("NY");
    });

    it("clears a dependent selection that no longer matches the group on connect", async () => {
      await setup(baseHtml({ countryValue: "US", stateValue: "ON" }));

      expect(document.getElementById("state").value).toBe("");
    });
  });

  describe("filter", () => {
    it("shows only the options matching the selected group", async () => {
      await setup(baseHtml());

      selectCountry("US");

      optionsFor("US").forEach((option) => {
        expect(option.hidden).toBe(false);
        expect(option.disabled).toBe(false);
      });
      optionsFor("CA").forEach((option) => {
        expect(option.hidden).toBe(true);
        expect(option.disabled).toBe(true);
      });
    });

    it("clears the dependent value when switching groups", async () => {
      await setup(baseHtml());
      selectCountry("US");
      document.getElementById("state").value = "NY";

      selectCountry("CA");

      expect(document.getElementById("state").value).toBe("");
    });

    it("keeps the dependent value when it still matches the new group", async () => {
      await setup(baseHtml());
      selectCountry("US");
      document.getElementById("state").value = "NY";

      selectCountry("US");

      expect(document.getElementById("state").value).toBe("NY");
    });

    it("hides every grouped option again when the group is cleared", async () => {
      await setup(baseHtml());
      selectCountry("US");

      selectCountry("");

      optionsFor("US")
        .concat(optionsFor("CA"))
        .forEach((option) => {
          expect(option.hidden).toBe(true);
          expect(option.disabled).toBe(true);
        });
    });
  });
});
