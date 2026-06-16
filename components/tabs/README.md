# Tabs

Show one panel at a time from a set of tab buttons, with full ARIA tablist support and arrow-key navigation.

## Usage

Copy [`tabs_controller.js`](./tabs_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import TabsController from "./tabs_controller";
application.register("tabs", TabsController);
```

## HTML

```html
<div data-controller="tabs">
  <div role="tablist" aria-label="Example tabs">
    <button
      type="button"
      data-tabs-target="tab"
      data-action="click->tabs#select keydown->tabs#keydown"
    >
      Tab One
    </button>
    <button
      type="button"
      data-tabs-target="tab"
      data-action="click->tabs#select keydown->tabs#keydown"
    >
      Tab Two
    </button>
    <button
      type="button"
      data-tabs-target="tab"
      data-action="click->tabs#select keydown->tabs#keydown"
    >
      Tab Three
    </button>
  </div>

  <div data-tabs-target="panel">
    <p>Content for tab one.</p>
  </div>
  <div data-tabs-target="panel">
    <p>Content for tab two.</p>
  </div>
  <div data-tabs-target="panel">
    <p>Content for tab three.</p>
  </div>
</div>
```

Tabs and panels are paired by position — the first tab controls the first panel, and so on.

To start on a tab other than the first, set `data-tabs-index-value`:

```html
<div data-controller="tabs" data-tabs-index-value="1">...</div>
```

## API

### Targets

| Target  | Required | Description                                                                      |
| ------- | -------- | -------------------------------------------------------------------------------- |
| `tab`   | Yes      | A tab button. Paired by index with the corresponding panel.                      |
| `panel` | Yes      | A tab panel. Paired by index with the corresponding tab. Hidden when not active. |

### Values

| Value   | Type   | Default | Description                                                                |
| ------- | ------ | ------- | -------------------------------------------------------------------------- |
| `index` | Number | `0`     | Index of the currently selected tab. Set in HTML to choose a starting tab. |

### Actions

| Action    | Description                                                                         |
| --------- | ----------------------------------------------------------------------------------- |
| `select`  | Activates the clicked tab and shows its panel. Wire to `click` on tab targets.      |
| `keydown` | Arrow-key navigation (Left / Right / Home / End). Wire to `keydown` on tab targets. |

## Accessibility

The controller sets up the full [ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/):

- `role="tab"` is added to each tab target; `role="tabpanel"` to each panel target.
- `aria-selected`, `tabindex`, `aria-controls`, and `aria-labelledby` are managed automatically.
- Inactive panels are hidden via the `hidden` attribute.
- Panels receive `tabindex="0"` so keyboard users can Tab into the active panel.
- If a tab or panel has no `id`, one is generated automatically to support `aria-controls` / `aria-labelledby` linking.

Add `role="tablist"` and an `aria-label` (or `aria-labelledby`) to the wrapper element that contains the tab buttons.

Keyboard behaviour (while a tab button has focus):

| Key          | Action                                |
| ------------ | ------------------------------------- |
| `ArrowRight` | Move to and activate the next tab     |
| `ArrowLeft`  | Move to and activate the previous tab |
| `Home`       | Move to and activate the first tab    |
| `End`        | Move to and activate the last tab     |
| `Tab`        | Move focus into the active panel      |
