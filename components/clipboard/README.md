# Clipboard

Copy text from a source element to the clipboard on button click, with optional brief feedback.

## Usage

Copy [`clipboard_controller.js`](./clipboard_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import ClipboardController from "./clipboard_controller";
application.register("clipboard", ClipboardController);
```

## HTML

```html
<!-- Copy an input's value -->
<div data-controller="clipboard">
  <input
    type="text"
    value="Hello world"
    data-clipboard-target="source"
    aria-label="Text to copy"
    readonly
  />
  <button type="button" data-action="click->clipboard#copy">Copy</button>
  <span data-clipboard-target="feedback" hidden aria-live="polite"
    >Copied!</span
  >
</div>
```

```html
<!-- Copy text content from any element -->
<div data-controller="clipboard">
  <code data-clipboard-target="source">gem "stimulus-rails"</code>
  <button type="button" data-action="click->clipboard#copy">Copy</button>
</div>
```

```html
<!-- Custom feedback duration (500ms) -->
<div data-controller="clipboard" data-clipboard-success-duration-value="500">
  <input
    type="text"
    value="API key"
    data-clipboard-target="source"
    aria-label="API key"
    readonly
  />
  <button type="button" data-action="click->clipboard#copy">Copy</button>
  <span data-clipboard-target="feedback" hidden aria-live="polite"
    >Copied!</span
  >
</div>
```

## API

### Targets

| Target     | Required | Description                                                                                |
| ---------- | -------- | ------------------------------------------------------------------------------------------ |
| `source`   | Yes      | Element to copy from. Uses `.value` if present (input/textarea), otherwise `.textContent`. |
| `feedback` | No       | Element shown briefly after a successful copy.                                             |

### Values

| Value             | Type   | Default | Description                               |
| ----------------- | ------ | ------- | ----------------------------------------- |
| `successDuration` | Number | `2000`  | Milliseconds to show the feedback target. |

### Actions

| Action | Description                     |
| ------ | ------------------------------- |
| `copy` | Copies source text to clipboard |

## Accessibility

- Add `aria-live="polite"` to the feedback element (already shown in the example) so screen readers announce the confirmation.
- A readonly `source` input has no visible `<label>` in the example above; give it an `aria-label` (or a visually hidden `<label>`) so screen reader users know what the field contains.
- Uses the `navigator.clipboard` API, which requires a secure context (HTTPS or localhost) and may prompt for permission in some browsers.
