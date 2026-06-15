# Password Rules

Show real-time feedback on whether a password satisfies a set of configurable rules. Each rule is a plain HTML element; the controller sets `data-valid="true"` or `data-valid="false"` on it as the user types. Your CSS handles the visual treatment.

## Usage

Copy [`password_rules_controller.js`](./password_rules_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import PasswordRulesController from "./password_rules_controller";
application.register("password-rules", PasswordRulesController);
```

## HTML

```html
<div data-controller="password-rules">
  <label for="password">New password</label>
  <input
    id="password"
    type="password"
    name="password"
    autocomplete="new-password"
    data-password-rules-target="input"
    data-action="input->password-rules#check"
  />

  <ul aria-label="Password requirements" aria-live="polite">
    <li data-password-rules-target="rule" data-min="8">
      At least 8 characters
    </li>
    <li data-password-rules-target="rule" data-pattern="[A-Z]">
      One uppercase letter
    </li>
    <li data-password-rules-target="rule" data-pattern="[a-z]">
      One lowercase letter
    </li>
    <li data-password-rules-target="rule" data-pattern="[0-9]">One number</li>
    <li data-password-rules-target="rule" data-pattern="[^A-Za-z0-9]">
      One special character
    </li>
  </ul>
</div>
```

## Styling with CSS

The controller writes `data-valid="true"` or `data-valid="false"` to each rule element. Style them however you like:

```css
[data-valid="true"] {
  color: green;
}

[data-valid="false"] {
  color: red;
}
```

Or with icons via CSS `content`:

```css
[data-password-rules-target="rule"]::before {
  content: "○ ";
}
[data-password-rules-target="rule"][data-valid="true"]::before {
  content: "✓ ";
  color: green;
}
[data-password-rules-target="rule"][data-valid="false"]::before {
  content: "✗ ";
  color: red;
}
```

## API

### Targets

| Target  | Required | Description                                                     |
| ------- | -------- | --------------------------------------------------------------- |
| `input` | Yes      | The password `<input>` to validate against.                     |
| `rule`  | Yes (1+) | Each rule element. Configure with `data-min` or `data-pattern`. |

#### Rule configuration attributes

| Attribute      | Description                                                                           |
| -------------- | ------------------------------------------------------------------------------------- |
| `data-min`     | Minimum character count (integer). e.g. `data-min="8"`.                               |
| `data-pattern` | Regular expression string tested against the full value. e.g. `data-pattern="[A-Z]"`. |

### Actions

| Action  | Description                                                   |
| ------- | ------------------------------------------------------------- |
| `check` | Evaluates all rules and updates their `data-valid` attributes |

## Accessibility

- Place `aria-live="polite"` on the rules container (e.g. the `<ul>`) so changes are announced to screen readers as the user types.
- The rule text itself (e.g. "At least 8 characters") is the accessible label — keep it descriptive enough to stand alone.
- Consider pairing with [`password-reveal`](../password-reveal/) so users can read what they're typing when troubleshooting failed rules.

## Security note

Client-side validation is UX-only. Always enforce password rules server-side as well.
