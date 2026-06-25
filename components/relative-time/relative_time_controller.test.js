import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Application } from "@hotwired/stimulus";
import RelativeTimeController from "./relative_time_controller";
import { getA11yViolations } from "../../test/axe";

const now = new Date("2026-06-25T12:00:00Z");

describe("RelativeTimeController", () => {
  let application;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    application = Application.start();
    application.register("relative-time", RelativeTimeController);
  });

  afterEach(async () => {
    document.body.innerHTML = "";
    if (vi.isFakeTimers()) {
      await vi.advanceTimersByTimeAsync(0);
    }
    application.stop();
    vi.useRealTimers();
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await vi.advanceTimersByTimeAsync(0);
  }

  it("renders a relative past time using the auto numeric style", async () => {
    await setup(`
      <time
        data-controller="relative-time"
        data-relative-time-locale-value="en-US"
        datetime="2026-06-25T11:55:00Z"
      >
        2026-06-25T11:55:00Z
      </time>
    `);

    expect(document.querySelector("time").textContent).toBe("5 minutes ago");
  });

  it("renders a relative future time", async () => {
    await setup(`
      <time
        data-controller="relative-time"
        data-relative-time-locale-value="en-US"
        datetime="2026-06-25T12:00:30Z"
      ></time>
    `);

    expect(document.querySelector("time").textContent).toBe("in 30 seconds");
  });

  it("falls back to the element's text content when no datetime attribute is present", async () => {
    await setup(`
      <time
        data-controller="relative-time"
        data-relative-time-locale-value="en-US"
      >2026-06-25T11:00:00Z</time>
    `);

    expect(document.querySelector("time").textContent).toBe("1 hour ago");
  });

  it("uses the always numeric style to avoid words like yesterday", async () => {
    await setup(`
      <time
        data-controller="relative-time"
        data-relative-time-locale-value="en-US"
        data-relative-time-numeric-value="always"
        datetime="2026-06-24T12:00:00Z"
      ></time>
    `);

    expect(document.querySelector("time").textContent).toBe("1 day ago");
  });

  it("formats according to a different locale", async () => {
    await setup(`
      <time
        data-controller="relative-time"
        data-relative-time-locale-value="es"
        datetime="2026-06-25T11:55:00Z"
      ></time>
    `);

    expect(document.querySelector("time").textContent).toBe("hace 5 minutos");
  });

  it("leaves the text content untouched when the source value can't be parsed", async () => {
    await setup(`
      <time data-controller="relative-time" datetime="not-a-real-date">
        not-a-real-date
      </time>
    `);

    expect(document.querySelector("time").textContent.trim()).toBe(
      "not-a-real-date",
    );
  });

  it("leaves the text content untouched when there is no datetime attribute or text content", async () => {
    await setup(`<time data-controller="relative-time"></time>`);

    expect(document.querySelector("time").textContent).toBe("");
  });

  it("does not throw and leaves the text content untouched when style is invalid", async () => {
    await setup(`
      <time
        data-controller="relative-time"
        data-relative-time-style-value="not-a-style"
        datetime="2026-06-25T11:55:00Z"
      >
        original text
      </time>
    `);

    expect(document.querySelector("time").textContent.trim()).toBe(
      "original text",
    );
  });

  it("re-renders on the configured interval", async () => {
    await setup(`
      <time
        data-controller="relative-time"
        data-relative-time-locale-value="en-US"
        data-relative-time-interval-value="1000"
        datetime="2026-06-25T11:55:00Z"
      ></time>
    `);

    expect(document.querySelector("time").textContent).toBe("5 minutes ago");

    vi.setSystemTime(new Date("2026-06-25T12:01:00Z"));
    await vi.advanceTimersByTimeAsync(1000);

    expect(document.querySelector("time").textContent).toBe("6 minutes ago");
  });

  it("stops re-rendering after disconnect", async () => {
    await setup(`
      <time
        data-controller="relative-time"
        data-relative-time-locale-value="en-US"
        data-relative-time-interval-value="1000"
        datetime="2026-06-25T11:55:00Z"
      ></time>
    `);

    const time = document.querySelector("time");
    document.body.innerHTML = "";
    await vi.advanceTimersByTimeAsync(0);

    vi.setSystemTime(new Date("2026-06-25T12:01:00Z"));
    await vi.advanceTimersByTimeAsync(1000);

    expect(time.textContent).toBe("5 minutes ago");
  });

  it("sets aria-live to polite on connect", async () => {
    await setup(`
      <time data-controller="relative-time" datetime="2026-06-25T11:55:00Z">
      </time>
    `);

    expect(document.querySelector("time").getAttribute("aria-live")).toBe(
      "polite",
    );
  });

  describe("accessibility", () => {
    it("has no detectable accessibility violations using the documented usage example", async () => {
      await setup(`
        <time
          id="widget"
          data-controller="relative-time"
          datetime="2026-06-25T11:55:00Z"
        >
          2026-06-25T11:55:00Z
        </time>
      `);
      vi.useRealTimers();
      const violations = await getA11yViolations(
        document.getElementById("widget"),
      );
      expect(violations).toEqual([]);
    });
  });
});
