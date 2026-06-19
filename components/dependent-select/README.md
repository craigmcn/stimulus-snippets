# Dependent Select

Filter a `<select>`'s options client-side based on the value of another select (Country → State, Category → Subcategory).

## Usage

Copy [`dependent_select_controller.js`](./dependent_select_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import DependentSelectController from "./dependent_select_controller";
application.register("dependent-select", DependentSelectController);
```

## HTML

```html
<div data-controller="dependent-select">
  <label for="country">Country</label>
  <select
    id="country"
    data-dependent-select-target="group"
    data-action="change->dependent-select#filter"
  >
    <option value="">Choose a country</option>
    <option value="US">United States</option>
    <option value="CA">Canada</option>
  </select>

  <label for="state">State / Province</label>
  <select id="state" data-dependent-select-target="dependent">
    <option value="">Choose a state</option>
    <option value="CA-state" data-dependent-select-group="US">
      California
    </option>
    <option value="NY" data-dependent-select-group="US">New York</option>
    <option value="ON" data-dependent-select-group="CA">Ontario</option>
    <option value="QC" data-dependent-select-group="CA">Quebec</option>
  </select>
</div>
```

On a server-rendered edit form, mark the previously-saved options `selected` on
both selects — `connect()` re-applies the filter so the page loads with the
correct state options already visible.

## API

### Targets

| Target      | Required | Description                                                                                           |
| ----------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `group`     | Yes      | The controlling `<select>` (e.g. Country).                                                            |
| `dependent` | Yes      | The `<select>` whose options are filtered. Its options are tagged with `data-dependent-select-group`. |

### Data attributes

| Attribute                     | Required | Description                                                                                                                               |
| ----------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `data-dependent-select-group` | No       | Set on a `dependent` `<option>` to the `group` value it belongs to. Options without this attribute (e.g. a placeholder) are always shown. |

### Actions

| Action   | Description                                                                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filter` | Hides and disables every `dependent` option whose group doesn't match the current `group` value. Clears the dependent selection if it no longer matches. |

## Accessibility

- Non-matching options are both `hidden` and `disabled`, so they're removed from the accessible options list and can't be reached by typeahead or arrow-key selection in any browser.
- An option without `data-dependent-select-group` (typically a placeholder like "Choose a state") is always visible, regardless of the selected group.
- This controller handles one level of dependency (Country → State). For a longer chain (Country → State → City), use a separate instance per link — each `dependent` select can also act as the `group` for the next one.
- Clearing the dependent select's value when its previous selection no longer matches relies on the native `<select>` falling back to its first option (or a blank value if one exists) — make sure a placeholder option with an empty `value` is present if you don't want a stale option silently becoming selected.
