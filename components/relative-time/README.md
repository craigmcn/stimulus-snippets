# Relative Time

Display a server-rendered timestamp as a live-updating "5 minutes ago" style relative time.

## Usage

Copy [`relative_time_controller.js`](./relative_time_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import RelativeTimeController from "./relative_time_controller";
application.register("relative-time", RelativeTimeController);
```

## HTML

```html
<time data-controller="relative-time" datetime="2026-06-25T11:55:00Z">
  2026-06-25T11:55:00Z
</time>
```

Render the `datetime` attribute on the server as an ISO 8601 UTC timestamp
(e.g. `created_at.utc.iso8601`) and put the same value (or any
human-readable fallback) as the element's text content for browsers without
JavaScript. On connect, the controller replaces the text content with a
relative description (`"5 minutes ago"`, `"in 2 days"`, `"yesterday"`) and
re-renders it on an interval so it stays current without a page reload —
the `datetime` attribute itself is left untouched, so the element stays
machine-readable.

```html
<!-- Force "X days ago" phrasing instead of "yesterday" -->
<time
  data-controller="relative-time"
  data-relative-time-numeric-value="always"
  datetime="2026-06-24T12:00:00Z"
>
  2026-06-24T12:00:00Z
</time>

<!-- Re-render every 10 seconds for a live activity feed -->
<time
  data-controller="relative-time"
  data-relative-time-interval-value="10000"
  datetime="2026-06-25T11:55:00Z"
>
  2026-06-25T11:55:00Z
</time>
```

## API

### Values

| Value      | Type   | Default | Description                                                                                                                                                                                      |
| ---------- | ------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `locale`   | String | —       | A BCP 47 locale tag (e.g. `es`). Defaults to the viewer's browser locale when omitted.                                                                                                           |
| `style`    | String | `long`  | An [`Intl.RelativeTimeFormat` `style`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat) (`long`, `short`, `narrow`). |
| `numeric`  | String | `auto`  | `auto` allows phrasing like `"yesterday"`/`"now"`; `always` forces numeric phrasing like `"1 day ago"`.                                                                                          |
| `interval` | Number | `60000` | Milliseconds between re-renders. Lower this for timestamps where second-level precision matters (e.g. a live feed); the 1-minute default suits typical `created_at`/`updated_at` display.        |

### Source value

The controller reads the timestamp to format from the element's `datetime`
attribute. If that attribute is absent, it falls back to the element's text
content. The source value must be parseable by the JavaScript `Date`
constructor — an ISO 8601 string (with a `Z` or UTC offset) is recommended
so the relative calculation is unambiguous regardless of the viewer's time
zone.

If the source value can't be parsed, the element is left as-is.

## Accessibility

- `aria-live="polite"` is applied to the element on connect, so assistive
  technology announces updated values without interrupting the user.
- Use a `<time>` element with the `datetime` attribute so assistive
  technology and browsers can still interpret the machine-readable value
  even though the visible text is relative and changes over time.
- Keep the no-JavaScript fallback text content meaningful (e.g. the same ISO
  string or a server-rendered date), since the controller may not run for
  some visitors.
