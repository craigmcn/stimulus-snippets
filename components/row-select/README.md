# Row Select

Select table rows with checkboxes — select-all, shift-click range select, and a bulk-actions bar that appears once anything is selected.

## Usage

Copy [`row_select_controller.js`](./row_select_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import RowSelectController from "./row_select_controller";
application.register("row-select", RowSelectController);
```

## HTML

```html
<div data-controller="row-select">
  <div data-row-select-target="bar" hidden>
    <span data-row-select-target="count"></span> selected
    <button type="button">Delete selected</button>
  </div>

  <table>
    <thead>
      <tr>
        <th>
          <input
            type="checkbox"
            data-row-select-target="all"
            data-action="change->row-select#toggleAll"
            aria-label="Select all rows"
          />
        </th>
        <th scope="col">Name</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <input
            type="checkbox"
            data-row-select-target="row"
            data-action="click->row-select#toggle"
            aria-label="Select Alice"
          />
        </td>
        <td>Alice</td>
      </tr>
      <tr>
        <td>
          <input
            type="checkbox"
            data-row-select-target="row"
            data-action="click->row-select#toggle"
            aria-label="Select Bob"
          />
        </td>
        <td>Bob</td>
      </tr>
    </tbody>
  </table>
</div>
```

The `data-controller` attribute must be on an ancestor of every target — the
bulk-actions bar doesn't need to be inside the `<table>`, but it does need to
share a common container with it.

## API

### Targets

| Target  | Required | Description                                                                                   |
| ------- | -------- | --------------------------------------------------------------------------------------------- |
| `all`   | No       | The "select all" checkbox. Reflects checked/indeterminate state as rows are selected.         |
| `row`   | Yes      | A per-row checkbox.                                                                           |
| `bar`   | No       | A bulk-actions container. Its `hidden` attribute is toggled — shown once any row is selected. |
| `count` | No       | Receives the number of currently selected rows as its text content.                           |

### Actions

| Action      | Description                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `toggleAll` | Checks or unchecks every `row` target to match the `all` checkbox.                                                                   |
| `toggle`    | Updates selection state for a single row. Shift-clicking a row selects (or deselects) every row between it and the last-clicked row. |

## Accessibility

- The `all` and `row` checkboxes need their own accessible names (`aria-label` or a wrapping `<label>`) — the controller doesn't add them, since the right label text is specific to your data (e.g. "Select Alice").
- `count` gets `aria-live="polite"` added automatically on connect, so screen reader users hear the running total as selections change.
- The `all` checkbox's native `indeterminate` state is set whenever some but not all rows are selected — this is a real DOM property, not an ARIA attribute, and is announced by screen readers without extra markup.
- Selected rows get a `data-row-select-selected` attribute (no value styling is assumed) so you can hook up a visual indicator via CSS.
- Range selection is triggered by `shiftKey` on a native checkbox `click` event — no extra keyboard handling is needed since checkboxes already support Tab/Space natively.
