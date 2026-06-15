# Checkbox Required

Require at least a minimum number of checkboxes in a group to be checked before the form can be submitted.

## Usage

Copy [`checkbox_required_controller.js`](./checkbox_required_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import CheckboxRequiredController from "./checkbox_required_controller";
application.register("checkbox-required", CheckboxRequiredController);
```

## HTML

```html
<!-- Require at least one (default) -->
<form>
  <fieldset data-controller="checkbox-required">
    <legend>Interests (select at least one)</legend>

    <label>
      <input
        type="checkbox"
        name="interests[]"
        value="music"
        data-checkbox-required-target="checkbox"
        data-action="change->checkbox-required#validate"
      />
      Music
    </label>
    <label>
      <input
        type="checkbox"
        name="interests[]"
        value="sport"
        data-checkbox-required-target="checkbox"
        data-action="change->checkbox-required#validate"
      />
      Sport
    </label>
    <label>
      <input
        type="checkbox"
        name="interests[]"
        value="film"
        data-checkbox-required-target="checkbox"
        data-action="change->checkbox-required#validate"
      />
      Film
    </label>

    <p data-checkbox-required-target="error" hidden>
      Please select at least one option.
    </p>
  </fieldset>

  <button type="submit">Submit</button>
</form>
```

```html
<!-- Require at least two -->
<fieldset
  data-controller="checkbox-required"
  data-checkbox-required-min-value="2"
>
  <!-- ... checkboxes ... -->
  <p data-checkbox-required-target="error" hidden>
    Please select at least two options.
  </p>
</fieldset>
```

The controller automatically intercepts the nearest parent `<form>`'s submit event — no additional wiring on the form element is needed.

## API

### Targets

| Target     | Required | Description                                                                               |
| ---------- | -------- | ----------------------------------------------------------------------------------------- |
| `checkbox` | Yes      | Each `<input type="checkbox">` that counts toward the minimum.                            |
| `error`    | No       | Shown when the group is invalid; hidden when valid. Set `hidden` on this element in HTML. |

### Values

| Value | Type   | Default | Description                                        |
| ----- | ------ | ------- | -------------------------------------------------- |
| `min` | Number | `1`     | Minimum number of checkboxes that must be checked. |

### Actions

| Action     | Description                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `validate` | Counts checked boxes; shows the error target and blocks form submission if fewer than `min` are checked. Wire to `change` on each checkbox for live feedback. |

## Accessibility

- The controller sets `data-valid="true"` or `data-valid="false"` on the wrapping element after each `validate` call. Use CSS to style the error message or checkboxes accordingly.
- Place the error message after the checkboxes in the DOM so screen readers encounter it in reading order.
- A native `<fieldset>` + `<legend>` communicates the group to assistive technology without extra ARIA.
