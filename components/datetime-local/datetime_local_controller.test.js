import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import DatetimeLocalController from "./datetime_local_controller";
import { getA11yViolations } from "../../test/axe";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const date = new Date("2026-06-19T15:30:00Z");

function expectedText(locale, options) {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

describe("DatetimeLocalController", () => {
  let application;

  beforeEach(() => {
    application = Application.start();
    application.register("datetime-local", DatetimeLocalController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await tick();
  }

  it("formats a UTC datetime attribute using the date and time style defaults", async () => {
    await setup(`
      <time
        data-controller="datetime-local"
        data-datetime-local-locale-value="en-US"
        data-datetime-local-time-zone-value="UTC"
        datetime="2026-06-19T15:30:00Z"
      >
        2026-06-19T15:30:00Z
      </time>
    `);

    const time = document.querySelector("time");
    expect(time.textContent).toBe(
      expectedText("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }),
    );
    expect(time.getAttribute("datetime")).toBe("2026-06-19T15:30:00Z");
  });

  it("respects a custom dateStyle and omits the time when timeStyle is none", async () => {
    await setup(`
      <time
        data-controller="datetime-local"
        data-datetime-local-locale-value="en-US"
        data-datetime-local-time-zone-value="UTC"
        data-datetime-local-date-style-value="full"
        data-datetime-local-time-style-value="none"
        datetime="2026-06-19T15:30:00Z"
      ></time>
    `);

    expect(document.querySelector("time").textContent).toBe(
      expectedText("en-US", { dateStyle: "full", timeZone: "UTC" }),
    );
  });

  it("respects a custom timeStyle and omits the date when dateStyle is none", async () => {
    await setup(`
      <time
        data-controller="datetime-local"
        data-datetime-local-locale-value="en-US"
        data-datetime-local-time-zone-value="UTC"
        data-datetime-local-date-style-value="none"
        data-datetime-local-time-style-value="long"
        datetime="2026-06-19T15:30:00Z"
      ></time>
    `);

    expect(document.querySelector("time").textContent).toBe(
      expectedText("en-US", { timeStyle: "long", timeZone: "UTC" }),
    );
  });

  it("formats according to a different locale", async () => {
    await setup(`
      <time
        data-controller="datetime-local"
        data-datetime-local-locale-value="en-GB"
        data-datetime-local-time-zone-value="UTC"
        data-datetime-local-date-style-value="short"
        datetime="2026-06-19T15:30:00Z"
      ></time>
    `);

    expect(document.querySelector("time").textContent).toBe(
      expectedText("en-GB", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "UTC",
      }),
    );
  });

  it("falls back to the element's text content when no datetime attribute is present", async () => {
    await setup(`
      <time
        data-controller="datetime-local"
        data-datetime-local-locale-value="en-US"
        data-datetime-local-time-zone-value="UTC"
      >2026-06-19T15:30:00Z</time>
    `);

    expect(document.querySelector("time").textContent).toBe(
      expectedText("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }),
    );
  });

  it("leaves the text content untouched when the source value can't be parsed", async () => {
    await setup(`
      <time data-controller="datetime-local" datetime="not-a-real-date">
        not-a-real-date
      </time>
    `);

    expect(document.querySelector("time").textContent.trim()).toBe(
      "not-a-real-date",
    );
  });

  it("leaves the text content untouched when both dateStyle and timeStyle are none", async () => {
    await setup(`
      <time
        data-controller="datetime-local"
        data-datetime-local-date-style-value="none"
        data-datetime-local-time-style-value="none"
        datetime="2026-06-19T15:30:00Z"
      >
        original text
      </time>
    `);

    expect(document.querySelector("time").textContent.trim()).toBe(
      "original text",
    );
  });

  it("leaves the text content untouched when there is no datetime attribute or text content", async () => {
    await setup(`<time data-controller="datetime-local"></time>`);

    expect(document.querySelector("time").textContent).toBe("");
  });

  it("does not throw and leaves the text content untouched when timeZone is invalid", async () => {
    await setup(`
      <time
        data-controller="datetime-local"
        data-datetime-local-time-zone-value="Not/AZone"
        datetime="2026-06-19T15:30:00Z"
      >
        original text
      </time>
    `);

    expect(document.querySelector("time").textContent.trim()).toBe(
      "original text",
    );
  });

  describe("accessibility", () => {
    it("has no detectable accessibility violations using the documented usage example", async () => {
      await setup(`
        <time
          id="widget"
          data-controller="datetime-local"
          datetime="2026-06-19T15:30:00Z"
        >
          2026-06-19T15:30:00Z
        </time>
      `);
      const violations = await getA11yViolations(
        document.getElementById("widget"),
      );
      expect(violations).toEqual([]);
    });
  });
});
