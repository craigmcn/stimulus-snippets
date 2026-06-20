# Number Format

Live thousands-separator and currency formatting on a text input, with a clean unformatted numeric value submitted via a hidden field.

## Usage

Copy [`number_format_controller.js`](./number_format_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import NumberFormatController from "./number_format_controller";
application.register("number-format", NumberFormatController);
```

## HTML

```html
<!-- Plain thousands separators -->
<div data-controller="number-format" data-number-format-locale-value="en-US">
  <label for="quantity">Quantity</label>
  <input
    id="quantity"
    name="order[quantity]"
    inputmode="decimal"
    data-number-format-target="input"
    data-action="input->number-format#format blur->number-format#blur focus->number-format#focus"
    value="1500"
  />
</div>
```

```html
<!-- Currency display, clean value submitted via a hidden field -->
<div data-controller="number-format" data-number-format-locale-value="en-US">
  <label for="price">Price</label>
  <input
    id="price"
    type="text"
    inputmode="decimal"
    data-number-format-style-value="currency"
    data-number-format-currency-value="USD"
    data-number-format-target="input"
    data-action="input->number-format#format blur->number-format#blur focus->number-format#focus"
    value="1234.5"
  />
  <input
    type="hidden"
    name="product[price]"
    data-number-format-target="hidden"
  />
</div>
```

When a `hidden` target is present, give the `name` attribute to the hidden input instead of the visible one — the visible input is for display only, and the hidden input always holds the clean numeric string actually submitted.

## API

### Targets

| Target   | Required | Description                                                                            |
| -------- | -------- | -------------------------------------------------------------------------------------- |
| `input`  | Yes      | The visible text input the user types into.                                            |
| `hidden` | No       | Receives the clean numeric string (no grouping, currency symbol, etc.) for submission. |

### Values

| Value                   | Type   | Default   | Description                                                        |
| ----------------------- | ------ | --------- | ------------------------------------------------------------------ |
| `locale`                | String | —         | Passed to `Intl.NumberFormat` for the formatted (blurred) display. |
| `style`                 | String | `decimal` | `decimal` or `currency`.                                           |
| `currency`              | String | `USD`     | ISO currency code. Used only when `style` is `currency`.           |
| `minimumFractionDigits` | Number | —         | Passed through to `Intl.NumberFormat`.                             |
| `maximumFractionDigits` | Number | —         | Passed through to `Intl.NumberFormat`.                             |

### Actions

| Action   | Description                                                                                                                        |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `format` | Call on `input`. Groups digits with thousands separators live as the user types, and syncs the clean value to the `hidden` target. |
| `focus`  | Call on `focus`. Strips grouping and currency symbols back to a plain editable value so the cursor isn't fighting formatting.      |
| `blur`   | Call on `blur`. Applies the full `Intl.NumberFormat` display (currency symbol, locale grouping) and syncs the `hidden` target.     |

`connect()` runs the same formatting as `blur` against the input's initial value, so a server-rendered raw value (e.g. `value="1234.5"`) displays formatted immediately on page load.

## Accessibility

- The `locale` value affects only the _formatted_ display (currency symbol placement, locale-specific grouping). Typed and submitted values always use a plain period as the decimal separator — round-tripping a locale's own separators (e.g. `1.234,56` in `de-DE`) back into a raw number is ambiguous, so this controller deliberately doesn't attempt it. If you need full locale-aware parsing, do it server-side.
- Add `inputmode="decimal"` on the visible input so mobile browsers show a numeric keyboard.
- The live `format` action preserves cursor position by digit count, not character offset, so inserting or removing a grouping separator doesn't push the cursor to an unexpected spot.
- If you don't need a separate submitted value (e.g. a quantity field where commas are harmless to the backend), omit the `hidden` target and the `name` attribute can stay on the visible `input`.
