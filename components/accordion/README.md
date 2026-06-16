# Accordion

Expand and collapse a set of content panels, with full ARIA disclosure support and optional single-open mode.

## When to use this vs. `<details>`/`<summary>`

**Reach for `<details>`/`<summary>` first** when:

- You have a single collapsible section (a "read more", an inline note).
- You have a group of independent disclosures with no coordination needed.
- You want exclusive single-open behaviour with no JavaScript — the `name` attribute on `<details>` groups elements so only one can be open at a time, and it has broad browser support.

**Reach for this controller** when your panels represent distinct, named sections of content that deserve heading-level structure:

- Screen reader users navigate by heading (`h2`, `h3`, …) to jump between sections. Wrapping each trigger in a heading element makes accordion sections discoverable in the document outline; `<details>` does not appear there.
- You want the full [ARIA Accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) — `aria-expanded`, `aria-controls`, `aria-labelledby` — wired up automatically.
- You want arrow-key navigation between triggers (`ArrowDown` / `ArrowUp` / `Home` / `End`).

## Usage

Copy [`accordion_controller.js`](./accordion_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import AccordionController from "./accordion_controller";
application.register("accordion", AccordionController);
```

## HTML

### Basic accordion (any number of panels open)

```html
<div data-controller="accordion">
  <h3>
    <button
      type="button"
      data-accordion-target="trigger"
      data-action="click->accordion#toggle keydown->accordion#keydown"
      aria-expanded="false"
    >
      Section One
    </button>
  </h3>
  <div data-accordion-target="panel" hidden>
    <p>Content for section one.</p>
  </div>

  <h3>
    <button
      type="button"
      data-accordion-target="trigger"
      data-action="click->accordion#toggle keydown->accordion#keydown"
      aria-expanded="false"
    >
      Section Two
    </button>
  </h3>
  <div data-accordion-target="panel" hidden>
    <p>Content for section two.</p>
  </div>

  <h3>
    <button
      type="button"
      data-accordion-target="trigger"
      data-action="click->accordion#toggle keydown->accordion#keydown"
      aria-expanded="false"
    >
      Section Three
    </button>
  </h3>
  <div data-accordion-target="panel" hidden>
    <p>Content for section three.</p>
  </div>
</div>
```

Triggers and panels are paired by position — the first trigger controls the first panel, and so on.

### Starting with a panel open

Omit `hidden` from the panel and set `aria-expanded="true"` on the trigger:

```html
<h3>
  <button
    type="button"
    data-accordion-target="trigger"
    data-action="click->accordion#toggle keydown->accordion#keydown"
    aria-expanded="true"
  >
    Section One
  </button>
</h3>
<div data-accordion-target="panel">
  <p>This panel starts open.</p>
</div>
```

### Single-open (exclusive) mode

Add `data-accordion-exclusive-value="true"` to ensure at most one panel is open at a time:

```html
<div data-controller="accordion" data-accordion-exclusive-value="true">
  <!-- same trigger/panel pairs as above -->
</div>
```

If the page loads with multiple panels open and exclusive mode is on, the controller keeps the first open panel and closes the rest.

## API

### Targets

| Target    | Required | Description                                                                  |
| --------- | -------- | ---------------------------------------------------------------------------- |
| `trigger` | Yes      | A `<button>` that toggles its paired panel. Paired by index with each panel. |
| `panel`   | Yes      | The content panel. Paired by index with each trigger. Hidden when collapsed. |

### Values

| Value       | Type    | Default | Description                                       |
| ----------- | ------- | ------- | ------------------------------------------------- |
| `exclusive` | Boolean | `false` | When `true`, opening one panel closes all others. |

### Actions

| Action    | Description                                                                             |
| --------- | --------------------------------------------------------------------------------------- |
| `toggle`  | Opens or closes the panel paired with the clicked trigger. Wire to `click` on triggers. |
| `keydown` | Arrow-key navigation between triggers. Wire to `keydown` on triggers.                   |

## Accessibility

The controller sets up the [ARIA Accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/):

- `aria-expanded` is set on each trigger on connect (derived from whether the paired panel is hidden) and kept in sync as panels open and close.
- `aria-controls` is set on each trigger pointing to its panel's `id`. If a panel has no `id`, one is generated automatically.
- `aria-labelledby` is set on each panel pointing to its trigger's `id`. If a trigger has no `id`, one is generated automatically.
- Panels are shown and hidden via the `hidden` attribute.

Wrap each trigger in a heading element at the appropriate level for the page outline (`h2`, `h3`, etc.). This lets screen reader users navigate to accordion sections by heading, which `<details>`/`<summary>` does not support.

Authoring note: include `aria-expanded` and `hidden` in your HTML so the correct state is present before Stimulus connects.

Keyboard behaviour (while a trigger has focus):

| Key             | Action                                                                 |
| --------------- | ---------------------------------------------------------------------- |
| `Enter`/`Space` | Toggle the focused panel (native `<button>` behaviour — fires `click`) |
| `ArrowDown`     | Move focus to the next trigger (wraps to first)                        |
| `ArrowUp`       | Move focus to the previous trigger (wraps to last)                     |
| `Home`          | Move focus to the first trigger                                        |
| `End`           | Move focus to the last trigger                                         |
