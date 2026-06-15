import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  dismiss() {
    this.element.remove();
  }

  hide() {
    this.element.hidden = true;
  }
}
