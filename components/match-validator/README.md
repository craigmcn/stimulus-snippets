# Match Validator

Require two fields to have the same value before the form can be submitted — password confirmation, email confirmation, and similar "type it again" patterns.

## Usage

Copy [`match_validator_controller.js`](./match_validator_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import MatchValidatorController from "./match_validator_controller";
application.register("match-validator", MatchValidatorController);
```

## HTML

```html
<form>
  <div data-controller="match-validator">
    <label for="password">Password</label>
    <input
      id="password"
      type="password"
      name="user[password]"
      autocomplete="new-password"
      data-match-validator-target="field"
      data-action="input->match-validator#validate"
    />

    <label for="password_confirmation">Confirm password</label>
    <input
      id="password_confirmation"
      type="password"
      name="user[password_confirmation]"
      autocomplete="new-password"
      data-match-validator-target="match"
      data-action="input->match-validator#validate"
    />

    <p data-match-validator-target="error" hidden>Passwords don't match.</p>
  </div>

  <button type="submit">Sign up</button>
</form>
```

```html
<!-- Case-insensitive match (e.g. email confirmation) -->
<div
  data-controller="match-validator"
  data-match-validator-case-sensitive-value="false"
>
  <input
    type="email"
    data-match-validator-target="field"
    data-action="input->match-validator#validate"
  />
  <input
    type="email"
    data-match-validator-target="match"
    data-action="input->match-validator#validate"
  />
  <p data-match-validator-target="error" hidden>Emails don't match.</p>
</div>
```

The controller automatically intercepts the nearest parent `<form>`'s submit event — no additional wiring on the form element is needed. Wire `input->match-validator#validate` on both fields for live feedback as the user types either one.

## API

### Targets

| Target  | Required | Description                                                                          |
| ------- | -------- | ------------------------------------------------------------------------------------ |
| `field` | Yes      | The original field (e.g. the password input).                                        |
| `match` | Yes      | The field that must match `field` (e.g. the confirmation input).                     |
| `error` | No       | Shown when the values don't match; hidden when they match. Set `hidden` in the HTML. |

### Values

| Value            | Type    | Default | Description                                            |
| ---------------- | ------- | ------- | ------------------------------------------------------ |
| `case-sensitive` | Boolean | `true`  | Set to `false` to compare values ignoring letter case. |

### Actions

| Action     | Description                                                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `validate` | Compares `field` and `match`; shows the error target and blocks form submission if they differ. Wire to `input` on either field for live feedback. |

## Accessibility

- The controller sets `aria-invalid="true"` or `aria-invalid="false"` on the `match` target after each `validate` call.
- The controller sets `data-valid="true"` or `data-valid="false"` on the wrapping element after each `validate` call. Use CSS to style the fields or error message accordingly.
- Place the error message after both fields in the DOM so screen readers encounter it in reading order, and consider an `aria-describedby` from the `match` field to the error target so it's announced when the field receives focus.
