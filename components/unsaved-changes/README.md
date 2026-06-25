# Unsaved Changes

Warns the user before they navigate away from a form with unsaved edits.

## Usage

Copy [`unsaved_changes_controller.js`](./unsaved_changes_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import UnsavedChangesController from "./unsaved_changes_controller";
application.register("unsaved-changes", UnsavedChangesController);
```

## HTML

```html
<form
  data-controller="unsaved-changes"
  data-unsaved-changes-message-value="Discard your edits?"
>
  <label for="post_title">Title</label>
  <input id="post_title" type="text" name="post[title]" />

  <button type="submit">Save</button>
</form>
```

Put `data-controller="unsaved-changes"` directly on the `<form>`. The controller listens for `input`/`change` anywhere inside it to mark the form dirty, and for the form's own `submit` event to mark it clean again — no per-field `data-action` wiring required.

When the form is dirty, leaving the page is guarded two ways:

- **Full page unload** (closing the tab, typing a new URL, a non-Turbo link) — the browser's native `beforeunload` confirmation dialog appears. Browsers ignore custom `beforeunload` text for security reasons, so `messageValue` has no effect here.
- **Turbo Drive visit** (`turbo:before-visit`, e.g. clicking a Turbo-managed link) — a `window.confirm()` dialog appears using `messageValue` (or a generic default), and the visit is cancelled if the user declines.

> **Note:** The dirty flag clears as soon as `submit` fires and isn't cancelled, not when the server confirms success. If a submission fails validation and re-renders the form, the page is no longer guarded even though the edits weren't actually saved. This matches the controller's minimal scope — pair it with your framework's own validation-error handling if that gap matters for a given form.

> **Note:** `turbo:before-visit` only fires for navigations Turbo Drive manages. If your app uses Turbo Streams to swap content without a full visit, call the `markClean` action manually after a successful save (e.g. from a `turbo:submit-end` listener) if you want the dirty flag cleared without a real `submit` event.

> **Note:** Combining this controller with [form-confirm](../form-confirm/) on the same `<form>` works as expected — if form-confirm's confirmation dialog cancels the submit (the user clicks Cancel), this controller does not mark the form clean, so the unsaved-changes guard stays active.

> **Note:** If a page has multiple `unsaved-changes`-controlled forms, declining one Turbo Drive visit confirmation prevents a second dirty form from also prompting for the same already-cancelled visit. Each _separate_ navigation attempt is still guarded independently per dirty form.

## API

### Values

| Value     | Type   | Default                                        | Description                                                                                        |
| --------- | ------ | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `message` | String | `"You have unsaved changes. Leave this page?"` | Confirmation text shown on a Turbo Drive visit. Has no effect on the native `beforeunload` dialog. |

### Actions

| Action      | Description                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `markDirty` | Marks the form as having unsaved changes. Called automatically on `input`/`change`; exposed for manual use (e.g. a rich-text editor that fires a custom change event instead). |
| `markClean` | Marks the form as saved/unguarded. Called automatically on `submit`; exposed for manual use (e.g. a "discard changes" button, or after a successful Turbo Stream save).        |

## Accessibility

This controller has no visual UI of its own — it relies on the browser's native `beforeunload` dialog and `window.confirm()`, both of which are handled accessibly by the browser/OS. No additional ARIA is required; ensure the form's own fields have visible `<label>` elements as usual.
