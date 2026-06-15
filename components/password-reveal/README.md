# Password Reveal

Toggle a password input between `password` (hidden) and `text` (visible) types, updating show/hide labels in sync.

## Usage

Copy [`password_reveal_controller.js`](./password_reveal_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import PasswordRevealController from "./password_reveal_controller";
application.register("password-reveal", PasswordRevealController);
```

## HTML

```html
<div data-controller="password-reveal">
  <label for="password">Password</label>
  <input
    id="password"
    type="password"
    name="password"
    autocomplete="current-password"
    data-password-reveal-target="input"
  />
  <button
    type="button"
    data-action="click->password-reveal#toggle"
    aria-label="Toggle password visibility"
  >
    <span data-password-reveal-target="showLabel">Show</span>
    <span data-password-reveal-target="hideLabel" hidden>Hide</span>
  </button>
</div>
```

```html
<!-- Without labels — button text changes via your own JS or CSS -->
<div data-controller="password-reveal">
  <label for="password">Password</label>
  <input
    id="password"
    type="password"
    name="password"
    autocomplete="current-password"
    data-password-reveal-target="input"
  />
  <button type="button" data-action="click->password-reveal#toggle">
    Show / Hide
  </button>
</div>
```

## API

### Targets

| Target      | Required | Description                                         |
| ----------- | -------- | --------------------------------------------------- |
| `input`     | Yes      | The password `<input>` whose type is toggled.       |
| `showLabel` | No       | Shown when password is hidden; hidden when visible. |
| `hideLabel` | No       | Shown when password is visible; hidden when hidden. |

### Actions

| Action   | Description                                              |
| -------- | -------------------------------------------------------- |
| `toggle` | Switches input type and flips show/hide label visibility |

## Accessibility

- Use `type="button"` to prevent accidental form submission.
- `aria-label="Toggle password visibility"` on the button describes the action to screen readers.
- Pair with `autocomplete="current-password"` (or `new-password`) so password managers work correctly regardless of the current input type.
