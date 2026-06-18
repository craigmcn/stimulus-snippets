import { Controller } from "@hotwired/stimulus";

const UNITS = ["B", "KB", "MB", "GB"];

export default class extends Controller {
  static targets = ["input", "list", "empty"];

  connect() {
    this._urls = [];
    this.preview();
  }

  disconnect() {
    this._revokeUrls();
  }

  preview() {
    this._revokeUrls();
    this.listTarget.replaceChildren();

    const files = this.hasInputTarget ? [...this.inputTarget.files] : [];
    files.forEach((file) => this.listTarget.appendChild(this._buildItem(file)));

    if (this.hasEmptyTarget) {
      this.emptyTarget.hidden = files.length !== 0;
    }
  }

  clear() {
    if (!this.hasInputTarget) return;
    this.inputTarget.value = "";
    this.preview();
  }

  _buildItem(file) {
    const isImage = file.type.startsWith("image/");

    const item = document.createElement("li");
    item.dataset.filePreviewType = isImage ? "image" : "file";

    if (isImage) {
      const url = URL.createObjectURL(file);
      this._urls.push(url);

      const img = document.createElement("img");
      img.src = url;
      img.alt = "";
      item.appendChild(img);
    }

    const name = document.createElement("span");
    name.dataset.filePreviewRole = "name";
    name.textContent = file.name;
    item.appendChild(name);

    const size = document.createElement("span");
    size.dataset.filePreviewRole = "size";
    size.textContent = this._formatSize(file.size);
    item.appendChild(size);

    return item;
  }

  _formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;

    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < UNITS.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(1)} ${UNITS[unitIndex]}`;
  }

  _revokeUrls() {
    this._urls.forEach((url) => URL.revokeObjectURL(url));
    this._urls = [];
  }
}
