# Dismiss

Click a button to remove or hide the controller element — alerts, flash notices, banners.

## Usage

Copy [`dismiss_controller.js`](./dismiss_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import DismissController from "./dismiss_controller";
application.register("dismiss", DismissController);
```

## HTML

```html
<!-- Removes element from the DOM -->
<div data-controller="dismiss" role="alert">
  <p>Your changes have been saved.</p>
  <button
    type="button"
    data-action="click->dismiss#dismiss"
    aria-label="Dismiss"
  >
    &times;
  </button>
</div>
```

```html
<!-- Hides element with the hidden attribute (stays in DOM) -->
<div data-controller="dismiss" role="alert">
  <p>Your changes have been saved.</p>
  <button type="button" data-action="click->dismiss#hide" aria-label="Dismiss">
    &times;
  </button>
</div>
```

## API

### Actions

| Action    | Description                                              |
| --------- | -------------------------------------------------------- |
| `dismiss` | Removes `this.element` from the DOM via `.remove()`      |
| `hide`    | Sets `this.element.hidden = true` (preserves in the DOM) |

No targets. No values.

## Accessibility

- Place `role="alert"` on the container so screen readers announce it on page load.
- Use `aria-label="Dismiss"` on the button if it has no visible text label.
- `dismiss` removes the element entirely — the screen reader announcement is gone. `hide` sets `hidden`, which removes it from the accessibility tree too, but the element can be programmatically un-hidden later.
