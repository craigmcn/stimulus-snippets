# Responsive Disable

Disables a form field while it's hidden by responsive CSS — media queries, Bootstrap `d-*` classes, Tailwind breakpoint utilities — so it isn't submitted, and re-enables it once it becomes visible again.

## Usage

Copy [`responsive_disable_controller.js`](./responsive_disable_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import ResponsiveDisableController from "./responsive_disable_controller";
application.register("responsive-disable", ResponsiveDisableController);
```

No `data-action` wiring is needed — the controller watches the window for resizes on its own.

## HTML

Controller on the field itself, hidden by a Tailwind breakpoint class:

```html
<label for="promo">Promo code</label>
<input
  id="promo"
  type="text"
  name="promo"
  class="hidden md:block"
  data-controller="responsive-disable"
/>
```

Controller on a wrapper, with a `field` target — needed when the responsive class hides a wrapper around the field rather than the field itself (a common Bootstrap pattern):

```html
<div class="d-none d-md-block" data-controller="responsive-disable">
  <label for="promo">Promo code</label>
  <input
    id="promo"
    type="text"
    name="promo"
    data-responsive-disable-target="field"
  />
</div>
```

Plain media queries work the same way — the controller doesn't care which mechanism sets `display: none`, only that something does.

If a pair of fields share the same `name` (e.g. one shown on a desktop layout, another on mobile, only one visible — and enabled — at a time), put the controller on **both** fields so each disables itself while hidden and their values stay in sync, regardless of which one the user typed into:

```html
<input
  type="text"
  name="promo"
  class="d-none d-md-block"
  data-controller="responsive-disable"
/>
<input
  type="text"
  name="promo"
  class="d-md-none"
  data-controller="responsive-disable"
/>
```

## API

### Targets

| Target  | Required | Description                                                                                                                   |
| ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `field` | No       | The form field to enable/disable. Defaults to the controller's own element, so a single-element setup needs no target at all. |

### Values

| Value   | Type   | Default | Description                                                                          |
| ------- | ------ | ------- | ------------------------------------------------------------------------------------ |
| `delay` | Number | `150`   | Debounce delay (ms) between a `resize` event and the visibility/`disabled` re-check. |

### Actions

None. `connect()` runs an initial check and a debounced `window` `resize` listener keeps the field's `disabled` state in sync after that; `disconnect()` removes the listener and cancels any pending debounced check.

## Accessibility

- Detection walks up from the field through its ancestors checking `getComputedStyle(el).display === "none"`, stopping once it reaches the controller's own element — an ancestor further up the page (e.g. a collapsible section the whole form happens to live in) never affects the field's `disabled` state, only visibility within the controller's own scope does.
- Fields sharing the same `name` are kept in sync via an `input` listener scoped to the closest `<form>` (or the whole document if there isn't one) — typing in whichever field is currently visible propagates its value to the others, so a hidden counterpart isn't stale if it becomes visible later. This only works for fields that each have their own `data-controller="responsive-disable"` instance; a same-name counterpart with no controller of its own neither disables while hidden nor has its edits synced anywhere.
- Only `display: none` is detected — this matches how both Bootstrap's and Tailwind's responsive visibility utilities (and plain media queries) hide elements. `visibility: hidden` and `opacity: 0` are deliberately not treated as "hidden," since neither of those already removes an element from the accessibility tree or tab order the way `display: none` does; a field hidden only that way would need its own explicit handling.
- Disabling a hidden field also removes it from the accessible name/tab order, which is already true of `display: none` on its own — this controller's only job is making sure the same field can't be submitted while hidden.
- This controller unconditionally owns the field's `disabled` attribute — it overwrites it on every check. Don't pair it with another mechanism that also toggles `disabled` on the same field (e.g. a separate loading-state controller); the two will fight each other.
- If the controller is placed on a wrapper without a `field` target pointing at the actual form control, it logs a console warning and leaves the field untouched rather than silently failing to disable it.
