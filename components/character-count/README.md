# Character Count

Show a live character count for a textarea or input, with optional remaining-characters feedback tied to a max length.

## Usage

Copy [`character_count_controller.js`](./character_count_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import CharacterCountController from "./character_count_controller";
application.register("character-count", CharacterCountController);
```

## HTML

```html
<!-- Remaining characters (most common) -->
<div data-controller="character-count" data-character-count-max-value="280">
  <label for="bio">Bio</label>
  <textarea
    id="bio"
    name="bio"
    maxlength="280"
    data-character-count-target="input"
    data-action="input->character-count#update"
  ></textarea>
  <p>
    <span data-character-count-target="remaining">280</span> characters
    remaining
  </p>
</div>
```

```html
<!-- Current count only (no max) -->
<div data-controller="character-count">
  <label for="notes">Notes</label>
  <textarea
    id="notes"
    name="notes"
    data-character-count-target="input"
    data-action="input->character-count#update"
  ></textarea>
  <p><span data-character-count-target="count">0</span> characters</p>
</div>
```

```html
<!-- Both count and remaining -->
<div data-controller="character-count" data-character-count-max-value="140">
  <label for="tweet">Tweet</label>
  <textarea
    id="tweet"
    name="tweet"
    maxlength="140"
    data-character-count-target="input"
    data-action="input->character-count#update"
  ></textarea>
  <p>
    <span data-character-count-target="count">0</span> /
    <span data-character-count-target="remaining">140</span>
  </p>
</div>
```

## API

### Targets

| Target      | Required | Description                                           |
| ----------- | -------- | ----------------------------------------------------- |
| `input`     | Yes      | The `<input>` or `<textarea>` being counted.          |
| `count`     | No       | Updated with the current character count.             |
| `remaining` | No       | Updated with `max - count`. Requires `max` value set. |

### Values

| Value | Type   | Default | Description                                               |
| ----- | ------ | ------- | --------------------------------------------------------- |
| `max` | Number | —       | Maximum character limit. Required for `remaining` target. |

### Actions

| Action   | Description                             |
| -------- | --------------------------------------- |
| `update` | Recalculates count and remaining values |

## Accessibility

- The controller adds `aria-live="polite"` to `count` and `remaining` targets on connect (if not already set), so screen readers announce updates as the user types.
- Set the initial value in the HTML (e.g. `280`) to avoid a flash of incorrect content before Stimulus connects.
- Adding `maxlength` to the input enforces the limit at the browser level; the `max` value here is only for the display counter.
