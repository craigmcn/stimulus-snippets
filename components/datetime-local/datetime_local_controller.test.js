import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import DatetimeLocalController from "./datetime_local_controller";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

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
    expect(time.textContent).toBe("Jun 19, 2026, 3:30 PM");
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
      "Friday, June 19, 2026",
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

    expect(document.querySelector("time").textContent).toBe("3:30:00 PM UTC");
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
      "19/06/2026, 15:30",
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
      "Jun 19, 2026, 3:30 PM",
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
});
