# stimulus-snippets

Copy-pasteable Stimulus JS controllers for Ruby on Rails. Inspired by [shadcn/ui](https://github.com/shadcn-ui/ui) — not an installable package, just files you own.

**Philosophy:**

- **Minimal** — the controller does as little as possible. One controller, one job.
- **Style-agnostic** — no CSS is included or assumed. Behaviour only.
- **Accessible** — ARIA attributes and keyboard patterns built in where relevant.
- **Data-driven** — configured entirely with `data-*` attributes in your HTML.

---

## How to use

1. Copy the controller file to `app/javascript/controllers/`.
2. Register it in your controller index.
3. Add `data-controller` and `data-action` attributes to your HTML.

```js
// app/javascript/controllers/index.js
import { Application } from "@hotwired/stimulus";
import DismissController from "./dismiss_controller";

const application = Application.start();
application.register("dismiss", DismissController);
```

With importmap (Rails 7+):

```ruby
# config/importmap.rb
pin "controllers/dismiss_controller", to: "controllers/dismiss_controller.js"
```

---

## Components

| Component                                          | Description                                                                          |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [dismiss](components/dismiss/)                     | Click to remove or hide an element (alerts, flash notices)                           |
| [clipboard](components/clipboard/)                 | Copy text to the clipboard with optional confirmation feedback                       |
| [password-reveal](components/password-reveal/)     | Toggle a password input between hidden and visible                                   |
| [character-count](components/character-count/)     | Live character counter for textarea or input                                         |
| [password-rules](components/password-rules/)       | Real-time rule-by-rule password strength feedback                                    |
| [checkbox-required](components/checkbox-required/) | Require at least N checkboxes in a group to be checked before form submit            |
| [slug](components/slug/)                           | Auto-populate a URL slug field from a source field as the user types                 |
| [tabs](components/tabs/)                           | Tab panel switcher with ARIA tablist pattern and arrow-key navigation                |
| [accordion](components/accordion/)                 | Expand/collapse content panels with ARIA disclosure and optional single-open mode    |
| [form-confirm](components/form-confirm/)           | `<dialog>`-based confirmation prompt before a form submits or a link/button proceeds |

---

## Well-covered elsewhere

The following patterns are intentionally not included here because mature, popular open-source implementations already exist. Reach for these instead:

| Pattern             | Package                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| Toggle / reveal     | [stimulus-reveal-controller](https://www.stimulus-components.com/docs/stimulus-reveal-controller/)     |
| Textarea autogrow   | [stimulus-textarea-autogrow](https://www.stimulus-components.com/docs/stimulus-textarea-autogrow/)     |
| Checkbox select all | [stimulus-checkbox-select-all](https://www.stimulus-components.com/docs/stimulus-checkbox-select-all/) |
| Dropdown            | [stimulus-dropdown](https://www.stimulus-components.com/docs/stimulus-dropdown/)                       |
| Auto-submit form    | [stimulus-auto-submit](https://www.stimulus-components.com/docs/stimulus-auto-submit/)                 |
| Rails nested form   | [stimulus-rails-nested-form](https://www.stimulus-components.com/docs/stimulus-rails-nested-form/)     |
| Autosave            | [stimulus-rails-autosave](https://www.stimulus-components.com/docs/stimulus-rails-autosave/)           |

---

## Requirements

- [`@hotwired/stimulus`](https://stimulus.hotwired.dev/) — already included in Rails 7+ via `stimulus-rails` gem.
- No other dependencies required. Controllers that benefit from [`stimulus-use`](https://github.com/stimulus-use/stimulus-use) note it in their README.

---

## Adding more components

See [CONTRIBUTING.md](CONTRIBUTING.md).
