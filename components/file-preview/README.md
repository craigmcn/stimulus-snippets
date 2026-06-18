# File Preview

Show a thumbnail (images) or filename and size (everything else) for files selected in a file input, before the form is submitted.

## Usage

Copy [`file_preview_controller.js`](./file_preview_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import FilePreviewController from "./file_preview_controller";
application.register("file-preview", FilePreviewController);
```

## HTML

```html
<div data-controller="file-preview">
  <label for="attachments">Attachments</label>
  <input
    id="attachments"
    type="file"
    multiple
    data-file-preview-target="input"
    data-action="change->file-preview#preview"
  />

  <button type="button" data-action="file-preview#clear">Clear</button>

  <ul data-file-preview-target="list"></ul>

  <p data-file-preview-target="empty">No files chosen.</p>
</div>
```

```css
/* Style by the data attribute the controller sets — no CSS is assumed */
[data-file-preview-type="image"] img {
  width: 3rem;
  height: 3rem;
  object-fit: cover;
}
```

## API

### Targets

| Target  | Required | Description                                                     |
| ------- | -------- | --------------------------------------------------------------- |
| `input` | Yes      | The `<input type="file">` to preview.                           |
| `list`  | Yes      | Container that receives one generated `<li>` per selected file. |
| `empty` | No       | Shown when no files are selected; hidden otherwise.             |

### Actions

| Action    | Description                                                                             |
| --------- | --------------------------------------------------------------------------------------- |
| `preview` | Re-renders the list from the input's current files. Wire to the input's `change` event. |
| `clear`   | Resets the input (clearing the selection) and re-renders the now-empty list.            |

### Generated markup

Each `<li>` carries `data-file-preview-type="image"` or `"file"` so you can target it in CSS. Image items include an `<img>` thumbnail (decorative — `alt=""`, since the filename is shown separately); every item includes `<span data-file-preview-role="name">` and `<span data-file-preview-role="size">`, separated by a literal " · " text node so the two don't run together in default (unstyled) rendering.

## Accessibility

- Thumbnails are decorative (`alt=""`); the filename is already exposed as text, so a screen reader doesn't need a redundant image description.
- The `empty` target's visibility is driven by the actual file count, so it stays in sync with what's selected — including after `clear`.
- This controller only previews the current selection; it does not replace the native `<input type="file">`, so keyboard and screen reader support for picking files is unaffected.

## Notes

- There's no per-file remove button. Removing one file from a `multiple` file input requires rebuilding its `FileList` via the `DataTransfer` API, which is real-browser-only behavior with no jsdom equivalent — out of scope for a controller this small. Use `clear` to reset the whole selection instead.
- Object URLs created for image thumbnails are revoked on the next render and on disconnect, so previewing many large images doesn't leak memory.
