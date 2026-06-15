# Slug

Auto-populate a URL slug field from a title or name field as the user types.

## Usage

Copy [`slug_controller.js`](./slug_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import SlugController from "./slug_controller";
application.register("slug", SlugController);
```

## HTML

```html
<div data-controller="slug">
  <div>
    <label for="post_title">Title</label>
    <input
      id="post_title"
      type="text"
      name="post[title]"
      data-slug-target="source"
      data-action="input->slug#generate"
    />
  </div>
  <div>
    <label for="post_slug">Slug</label>
    <input
      id="post_slug"
      type="text"
      name="post[slug]"
      data-slug-target="output"
      data-action="input->slug#lock"
    />
  </div>
</div>
```

Once the user manually edits the output field, auto-generation stops. If the output already has a value when the controller connects (e.g. on an edit form), it starts locked.

## API

### Targets

| Target   | Required | Description                                       |
| -------- | -------- | ------------------------------------------------- |
| `source` | Yes      | The field whose value is transformed into a slug. |
| `output` | Yes      | The field that receives the generated slug.       |

### Values

None.

### Actions

| Action     | Description                                                                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generate` | Transforms the source field value to a slug and writes it to the output field. No-op if the output has been manually edited. Wire to `input` on the source field. |
| `lock`     | Stops further auto-generation. Wire to `input` on the output field.                                                                                               |

## Accessibility

The slug field is a standard text input — no additional ARIA attributes are required. Ensure both fields have visible `<label>` elements.
