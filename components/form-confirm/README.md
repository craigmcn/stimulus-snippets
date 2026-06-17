# Form Confirm

Show a `<dialog>`-based confirmation prompt before a form submits or a link/button proceeds, replacing Rails 7's removed `data-confirm` UJS behaviour.

## Usage

Copy [`form_confirm_controller.js`](./form_confirm_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import FormConfirmController from "./form_confirm_controller";
application.register("form-confirm", FormConfirmController);
```

## HTML

### Confirming a destructive form submission

```html
<div
  data-controller="form-confirm"
  data-form-confirm-message-value="Delete this post? This cannot be undone."
>
  <form
    action="/posts/1"
    method="post"
    data-action="submit->form-confirm#intercept"
  >
    <input type="hidden" name="_method" value="delete" />
    <button type="submit">Delete</button>
  </form>

  <dialog data-form-confirm-target="dialog">
    <p data-form-confirm-target="message"></p>
    <button type="button" data-action="click->form-confirm#proceed">
      Delete
    </button>
    <button type="button" data-action="click->form-confirm#cancel">
      Cancel
    </button>
  </dialog>
</div>
```

### Confirming a link or button click

Any clickable element works the same way — wire `click` instead of `submit`:

```html
<div data-controller="form-confirm">
  <a href="/cart/clear" data-action="click->form-confirm#intercept">
    Clear cart
  </a>

  <dialog data-form-confirm-target="dialog">
    <p>Clear your cart? Items will not be saved.</p>
    <button type="button" data-action="click->form-confirm#proceed">
      Clear
    </button>
    <button type="button" data-action="click->form-confirm#cancel">
      Cancel
    </button>
  </dialog>
</div>
```

## API

### Targets

| Target    | Required | Description                                                             |
| --------- | -------- | ----------------------------------------------------------------------- |
| `dialog`  | Yes      | The `<dialog>` element shown for confirmation.                          |
| `message` | No       | An element whose text is set from `messageValue` when the dialog opens. |

### Values

| Value     | Type   | Default | Description                                                   |
| --------- | ------ | ------- | ------------------------------------------------------------- |
| `message` | String | `""`    | Text written into the `message` target when the dialog opens. |

### Actions

| Action      | Description                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------- |
| `intercept` | Stops the original `submit` or `click`, records the source element, and opens the dialog.          |
| `proceed`   | Closes the dialog and re-issues the original action (`form.requestSubmit()` or `element.click()`). |
| `cancel`    | Closes the dialog and discards the pending action.                                                 |

## Accessibility

- `<dialog>` showing via `showModal()` traps focus and is announced by screen readers automatically; the controller falls back to toggling the `open` attribute in environments without `showModal()` support.
- Give the dialog's confirm and cancel buttons clear, distinct labels (e.g. "Delete" / "Cancel") rather than generic "OK" / "Cancel" — screen reader users hear them out of context from the triggering element.
- Wire `data-action="cancel->form-confirm#cancel"` on the `dialog` target if you want pressing <kbd>Esc</kbd> to also clear the pending action (native `<dialog>` fires a `cancel` event on <kbd>Esc</kbd> when shown via `showModal()`).
- This controller intercepts a single element's `submit`/`click` event. For Turbo's `data-turbo-method` links, which bypass the DOM's native form-submission flow, prefer [`Turbo.setConfirmMethod()`](https://turbo.hotwired.dev/reference/drive#custom-confirmation-method) to swap in a dialog-based confirm globally instead.
