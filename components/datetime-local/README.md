# Datetime Local

Display a server-rendered UTC timestamp in the viewer's local time zone.

## Usage

Copy [`datetime_local_controller.js`](./datetime_local_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import DatetimeLocalController from "./datetime_local_controller";
application.register("datetime-local", DatetimeLocalController);
```

## HTML

```html
<time data-controller="datetime-local" datetime="2026-06-19T15:30:00Z">
  2026-06-19T15:30:00Z
</time>
```

Render the `datetime` attribute on the server as an ISO 8601 UTC timestamp
(e.g. `created_at.utc.iso8601`) and put the same value (or any
human-readable fallback) as the element's text content for browsers without
JavaScript. On connect, the controller parses `datetime` and replaces the
text content with a version formatted in the viewer's local time zone —
the `datetime` attribute itself is left untouched, so the element stays
machine-readable.

```html
<!-- Date only -->
<time
  data-controller="datetime-local"
  data-datetime-local-time-style-value="none"
  datetime="2026-06-19T15:30:00Z"
>
  2026-06-19
</time>

<!-- Time only, with a longer style -->
<time
  data-controller="datetime-local"
  data-datetime-local-date-style-value="none"
  data-datetime-local-time-style-value="long"
  datetime="2026-06-19T15:30:00Z"
>
  15:30:00 UTC
</time>
```

## API

### Values

| Value       | Type   | Default  | Description                                                                                                                                                                                                                  |
| ----------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dateStyle` | String | `medium` | An [`Intl.DateTimeFormat` `dateStyle`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) (`full`, `long`, `medium`, `short`), or `none` to omit the date. |
| `timeStyle` | String | `short`  | An `Intl.DateTimeFormat` `timeStyle` (`full`, `long`, `medium`, `short`), or `none` to omit the time.                                                                                                                        |
| `locale`    | String | —        | A BCP 47 locale tag (e.g. `en-GB`). Defaults to the viewer's browser locale when omitted.                                                                                                                                    |
| `timeZone`  | String | —        | An IANA time zone (e.g. `America/New_York`). Defaults to the viewer's system time zone when omitted.                                                                                                                         |

Setting both `dateStyle` and `timeStyle` to `none` leaves the original text
content untouched, since there would be nothing left to format.

### Source value

The controller reads the timestamp to format from the element's `datetime`
attribute. If that attribute is absent, it falls back to the element's text
content. The source value must be parseable by the JavaScript `Date`
constructor — an ISO 8601 string (with a `Z` or UTC offset) is recommended
so the timestamp is unambiguous regardless of the viewer's time zone.

If the source value can't be parsed, the element is left as-is.

## Accessibility

- Use a `<time>` element with the `datetime` attribute so assistive
  technology and browsers can still interpret the machine-readable value
  even though the visible text has been localized.
- The reformatted text is plain text, not live — there's no `aria-live`
  region, since the value is set once on connect rather than updating
  continuously like a countdown.
- Keep the no-JavaScript fallback text content meaningful (e.g. the same ISO
  string or a server-rendered date), since the controller may not run for
  some visitors.
