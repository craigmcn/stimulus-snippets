# Table Sort

Click a column header to sort a table's rows by that column, with automatic string/number/date type detection.

## Usage

Copy [`table_sort_controller.js`](./table_sort_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import TableSortController from "./table_sort_controller";
application.register("table-sort", TableSortController);
```

## HTML

```html
<table data-controller="table-sort">
  <thead>
    <tr>
      <th scope="col">
        <button
          type="button"
          data-table-sort-target="header"
          data-action="click->table-sort#sort"
        >
          Name
        </button>
      </th>
      <th scope="col">
        <button
          type="button"
          data-table-sort-target="header"
          data-action="click->table-sort#sort"
        >
          Age
        </button>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr data-table-sort-target="row">
      <td>Charlie</td>
      <td>40</td>
    </tr>
    <tr data-table-sort-target="row">
      <td>Alice</td>
      <td>30</td>
    </tr>
    <tr data-table-sort-target="row">
      <td>Bob</td>
      <td>25</td>
    </tr>
  </tbody>
</table>
```

Each sortable column needs a `<button>` inside its `<th>` (for native keyboard
support) wired to the `header` target, and every sortable `<tbody>` row needs
the `row` target. The column to sort by is determined by the clicked header's
position in its `<tr>` — non-sortable columns (e.g. an actions column with no
`header` target) are fine to mix in.

## API

### Targets

| Target   | Required | Description                                                                                       |
| -------- | -------- | ------------------------------------------------------------------------------------------------- |
| `header` | Yes      | A `<button>` inside a sortable column's `<th>`. Click toggles that column's sort.                 |
| `row`    | Yes      | A `<tbody>` row participating in sorting. All `row` targets must share the same `<tbody>` parent. |

### Data attributes

| Attribute               | Required | Description                                                                                                                                                                                                   |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-table-sort-type`  | No       | Set on a `header` button to force `"string"`, `"number"`, or `"date"` comparison instead of auto-detecting from the first row's cell text. Any other value is ignored and falls back to auto-detection.       |
| `data-table-sort-value` | No       | Set on a `<td>` to provide the comparison value instead of the cell's displayed text — useful when the display text isn't directly sortable (e.g. a formatted date, or a month name backed by a numeric key). |

Type auto-detection checks the first row's cell for that column in this order:
number → date → string. Override with `data-table-sort-type` for ambiguous
columns (e.g. a 4-digit ID that should never be read as a year).

### Actions

| Action | Description                                                                                                                                          |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sort` | Sorts `row` targets by the clicked header's column. Clicking the same header again reverses direction; clicking a different header starts ascending. |

## Accessibility

- Each sortable `<th>` gets `aria-sort` (`"none"`, `"ascending"`, or `"descending"`), kept in sync as columns are sorted — screen readers announce the current sort state on the column header.
- Wrapping the clickable label in a real `<button>` means Tab/Enter/Space work without any extra keyboard handling in the controller.
- `scope="col"` on each `<th>` (shown in the example above) is standard table markup, not specific to this controller, but is required for the header/cell association screen readers rely on.
- This controller assumes a single `<tbody>`; for multiple tbodies, use a separate instance per `<tbody>` with its own `<thead>`.
