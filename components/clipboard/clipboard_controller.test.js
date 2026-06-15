import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Application } from "@hotwired/stimulus";
import ClipboardController from "./clipboard_controller";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("ClipboardController", () => {
  let application;
  let writeText;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    application = Application.start();
    application.register("clipboard", ClipboardController);
  });

  afterEach(() => {
    application.stop();
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  async function setup(html) {
    document.body.innerHTML = html;
    await tick();
  }

  it("copies the value of an input source", async () => {
    await setup(`
      <div data-controller="clipboard">
        <input data-clipboard-target="source" value="hello world">
        <button id="btn" data-action="click->clipboard#copy">Copy</button>
      </div>
    `);

    document.getElementById("btn").click();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith("hello world");
  });

  it("copies the trimmed textContent of a non-input source", async () => {
    await setup(`
      <div data-controller="clipboard">
        <code data-clipboard-target="source">  npm install  </code>
        <button id="btn" data-action="click->clipboard#copy">Copy</button>
      </div>
    `);

    document.getElementById("btn").click();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith("npm install");
  });

  it("shows the feedback target after a successful copy", async () => {
    await setup(`
      <div data-controller="clipboard">
        <input data-clipboard-target="source" value="text">
        <span id="feedback" data-clipboard-target="feedback" hidden>Copied!</span>
        <button id="btn" data-action="click->clipboard#copy">Copy</button>
      </div>
    `);

    vi.useFakeTimers();
    document.getElementById("btn").click();
    await Promise.resolve();

    expect(document.getElementById("feedback").hidden).toBe(false);
  });

  it("hides the feedback target after successDuration elapses", async () => {
    await setup(`
      <div data-controller="clipboard">
        <input data-clipboard-target="source" value="text">
        <span id="feedback" data-clipboard-target="feedback" hidden>Copied!</span>
        <button id="btn" data-action="click->clipboard#copy">Copy</button>
      </div>
    `);

    vi.useFakeTimers();
    document.getElementById("btn").click();
    await Promise.resolve();

    vi.advanceTimersByTime(2000);

    expect(document.getElementById("feedback").hidden).toBe(true);
  });

  it("respects a custom successDuration", async () => {
    await setup(`
      <div data-controller="clipboard" data-clipboard-success-duration-value="500">
        <input data-clipboard-target="source" value="text">
        <span id="feedback" data-clipboard-target="feedback" hidden>Copied!</span>
        <button id="btn" data-action="click->clipboard#copy">Copy</button>
      </div>
    `);

    vi.useFakeTimers();
    document.getElementById("btn").click();
    await Promise.resolve();

    vi.advanceTimersByTime(499);
    expect(document.getElementById("feedback").hidden).toBe(false);

    vi.advanceTimersByTime(1);
    expect(document.getElementById("feedback").hidden).toBe(true);
  });

  it("works without a feedback target", async () => {
    await setup(`
      <div data-controller="clipboard">
        <input data-clipboard-target="source" value="text">
        <button id="btn" data-action="click->clipboard#copy">Copy</button>
      </div>
    `);

    expect(() => document.getElementById("btn").click()).not.toThrow();
    await Promise.resolve();
    expect(writeText).toHaveBeenCalled();
  });

  it("does not throw when clipboard write is rejected", async () => {
    writeText.mockRejectedValue(new DOMException("Permission denied"));

    await setup(`
      <div data-controller="clipboard">
        <input data-clipboard-target="source" value="text">
        <span id="feedback" data-clipboard-target="feedback" hidden>Copied!</span>
        <button id="btn" data-action="click->clipboard#copy">Copy</button>
      </div>
    `);

    document.getElementById("btn").click();
    await Promise.resolve();
    await Promise.resolve();

    expect(document.getElementById("feedback").hidden).toBe(true);
  });

  it("cancels the feedback timer on disconnect", async () => {
    await setup(`
      <div id="ctrl" data-controller="clipboard">
        <input data-clipboard-target="source" value="text">
        <span id="feedback" data-clipboard-target="feedback" hidden>Copied!</span>
        <button id="btn" data-action="click->clipboard#copy">Copy</button>
      </div>
    `);

    vi.useFakeTimers();
    document.getElementById("btn").click();
    await Promise.resolve();

    expect(document.getElementById("feedback").hidden).toBe(false);

    document.getElementById("ctrl").remove();
    vi.advanceTimersByTime(3000);

    expect(() => vi.runAllTimers()).not.toThrow();
  });
});
