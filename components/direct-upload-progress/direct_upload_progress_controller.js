import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["list", "status"];

  connect() {
    this._items = new Map();

    if (this.hasStatusTarget && !this.statusTarget.hasAttribute("aria-live")) {
      this.statusTarget.setAttribute("aria-live", "polite");
    }
  }

  add(event) {
    const { id, file } = event.detail;
    this.listTarget.appendChild(this._buildItem(id, file));
    this._announce(`Uploading ${file.name}…`);
  }

  progress(event) {
    const { id, progress } = event.detail;
    const item = this._items.get(id);
    if (!item) return;

    item.progressElement.value = progress;
  }

  error(event) {
    const { id, error } = event.detail;
    const item = this._items.get(id);
    if (!item) return;

    item.element.dataset.directUploadProgressState = "error";
    this._announce(`${item.file.name} failed: ${error}`);
    this._items.delete(id);
  }

  end(event) {
    const { id } = event.detail;
    const item = this._items.get(id);
    if (!item) return;

    if (item.element.dataset.directUploadProgressState !== "error") {
      item.element.dataset.directUploadProgressState = "done";
      item.progressElement.value = 100;
      this._announce(`${item.file.name} uploaded`);
    }

    this._items.delete(id);
  }

  _buildItem(id, file) {
    const element = document.createElement("li");
    element.dataset.directUploadProgressState = "uploading";

    const name = document.createElement("span");
    name.dataset.directUploadProgressRole = "name";
    name.textContent = file.name;
    element.appendChild(name);

    const progressElement = document.createElement("progress");
    progressElement.max = 100;
    progressElement.value = 0;
    progressElement.setAttribute("aria-label", file.name);
    element.appendChild(progressElement);

    this._items.set(id, { element, progressElement, file });

    return element;
  }

  _announce(message) {
    if (this.hasStatusTarget) this.statusTarget.textContent = message;
  }
}
