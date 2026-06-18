# Search Filter

Filter a list of items client-side as the user types, with an optional "no results" message.

## Usage

Copy [`search_filter_controller.js`](./search_filter_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import SearchFilterController from "./search_filter_controller";
application.register("search-filter", SearchFilterController);
```

## HTML

```html
<div data-controller="search-filter">
  <label for="fruit-search">Filter fruits</label>
  <input
    id="fruit-search"
    type="search"
    data-search-filter-target="input"
    data-action="input->search-filter#filter"
  />

  <ul>
    <li data-search-filter-target="item">Apple</li>
    <li data-search-filter-target="item">Banana</li>
    <li data-search-filter-target="item">Cherry</li>
  </ul>

  <p data-search-filter-target="empty" hidden>No fruits match your search.</p>
</div>
```

```html
<!-- Matching against something other than the visible text -->
<li
  data-search-filter-target="item"
  data-search-filter-term="invoice 1042 acme corp"
>
  #1042 — Acme Corp
</li>
```

## API

### Targets

| Target  | Required | Description                                                                          |
| ------- | -------- | ------------------------------------------------------------------------------------ |
| `input` | Yes      | The search `<input>`.                                                                |
| `item`  | Yes      | One per filterable row. Hidden (`hidden` attribute) when it doesn't match the query. |
| `empty` | No       | Shown when no items match; hidden otherwise.                                         |

### Data attributes

| Attribute                 | Required | Description                                                                        |
| ------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `data-search-filter-term` | No       | Overrides what an `item` is matched against. Defaults to the item's `textContent`. |

### Actions

| Action   | Description                                          |
| -------- | ---------------------------------------------------- |
| `filter` | Re-evaluates every `item` against the current query. |

## Accessibility

- The controller adds `aria-live="polite"` to the `empty` target on connect (if not already set), so screen readers announce when a search returns no results.
- Matching is case-insensitive and ignores leading/trailing whitespace; it does not match across word boundaries (substring match only) or fuzzy-match typos.
- Use `<input type="search">` for the built-in clear button and consistent mobile keyboard behavior.
- Hidden items are removed from the accessibility tree and tab order via the native `hidden` attribute, not just visually hidden with CSS.
