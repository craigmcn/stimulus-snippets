# Direct Upload Progress

Show a progress bar for each file as it uploads via Rails ActiveStorage direct uploads.

## Usage

Copy [`direct_upload_progress_controller.js`](./direct_upload_progress_controller.js) to `app/javascript/controllers/` and register it:

```js
// app/javascript/controllers/index.js
import DirectUploadProgressController from "./direct_upload_progress_controller";
application.register("direct-upload-progress", DirectUploadProgressController);
```

`activestorage`'s direct upload JS already dispatches `direct-upload:*` custom events on the file input — this controller just listens for them and renders the UI. No server-side changes are needed beyond the usual `data-direct-upload-url` setup.

## HTML

```html
<div data-controller="direct-upload-progress">
  <label for="attachments">Attachments</label>
  <input
    id="attachments"
    type="file"
    multiple
    name="post[attachments][]"
    data-direct-upload-url="/rails/active_storage/direct_uploads"
    data-action="
      direct-upload:initialize->direct-upload-progress#add
      direct-upload:progress->direct-upload-progress#progress
      direct-upload:error->direct-upload-progress#error
      direct-upload:end->direct-upload-progress#end
    "
  />

  <ul data-direct-upload-progress-target="list"></ul>
  <p data-direct-upload-progress-target="status"></p>
</div>
```

Each selected file gets its own `<li>` containing the file name and a native `<progress>` element, added when ActiveStorage dispatches `direct-upload:initialize` and updated as `direct-upload:progress` events arrive.

## API

### Targets

| Target   | Required | Description                                                                                                               |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `list`   | Yes      | Container that receives one `<li>` per file being uploaded.                                                               |
| `status` | No       | Receives a short text message on upload start/success/failure. Gets `aria-live="polite"` auto-applied if not already set. |

### Actions

| Action     | Wire to                    | Description                                                               |
| ---------- | -------------------------- | ------------------------------------------------------------------------- |
| `add`      | `direct-upload:initialize` | Adds a progress item for the file.                                        |
| `progress` | `direct-upload:progress`   | Updates the item's `<progress>` value (`event.detail.progress` is 0–100). |
| `error`    | `direct-upload:error`      | Marks the item as errored and announces the failure message.              |
| `end`      | `direct-upload:end`        | Marks a non-errored item as done and sets its progress to 100.            |

All four events are dispatched by ActiveStorage's own direct upload JS on the file input element — wire them all via `data-action` on the `input`, as shown above.

### Item state

Each `<li>` gets `data-direct-upload-progress-state`, one of `uploading`, `done`, or `error`. Use it to style the row (e.g. a red border on `error`). The filename `<span>` inside it carries `data-direct-upload-progress-role="name"` so you can target it in CSS.

## Accessibility

- Each file's `<progress>` element has an `aria-label` of the file name, so screen reader users hear which file a given progress bar belongs to.
- The optional `status` target gets `aria-live="polite"` applied automatically (unless already set) and is updated only on upload start, success, and failure — not on every percentage tick, to avoid spamming screen reader users.
