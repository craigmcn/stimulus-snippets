# Patterns well-covered elsewhere

The following patterns are intentionally not included as controllers on this site because mature, popular open-source implementations already exist. Reach for these instead:

| Pattern               | Package                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toggle / reveal       | [stimulus-reveal-controller](https://www.stimulus-components.com/docs/stimulus-reveal-controller/)                                                |
| Textarea autogrow     | [stimulus-textarea-autogrow](https://www.stimulus-components.com/docs/stimulus-textarea-autogrow/)                                                |
| Checkbox select all   | [stimulus-checkbox-select-all](https://www.stimulus-components.com/docs/stimulus-checkbox-select-all/)                                            |
| Dropdown              | [stimulus-dropdown](https://www.stimulus-components.com/docs/stimulus-dropdown/)                                                                  |
| Auto-submit form      | [stimulus-auto-submit](https://www.stimulus-components.com/docs/stimulus-auto-submit/)                                                            |
| Rails nested form     | [stimulus-rails-nested-form](https://www.stimulus-components.com/docs/stimulus-rails-nested-form/)                                                |
| Autosave              | [stimulus-rails-autosave](https://www.stimulus-components.com/docs/stimulus-rails-autosave/)                                                      |
| Modal / dialog        | [stimulus-components Modal](https://www.stimulus-components.com/docs/stimulus-modal-component/)                                                   |
| Drag-and-drop reorder | [stimulus-sortable](https://github.com/stimulus-components/stimulus-sortable) (wraps SortableJS)                                                  |
| Keyboard shortcuts    | [stimulus-hotkeys](https://github.com/leastbad/stimulus-hotkeys)                                                                                  |
| Async HTML loading    | [stimulus-content-loader](https://github.com/stimulus-components/stimulus-content-loader) — or a Turbo `<turbo-frame>` if Turbo is already in use |

For textarea autogrow specifically, also consider the CSS-only [`field-sizing: content`](https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing) property — no JS needed in [browsers that support it](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing#browser_compatibility) (Chrome/Edge 123+, Safari 26.2; in preview in Firefox; as of 2026).

## stimulus-use

None of the controllers on this site require a dependency beyond [`@hotwired/stimulus`](https://stimulus.hotwired.dev/) itself. If a controller benefits from one of the composable behaviors in [`stimulus-use`](https://github.com/stimulus-use/stimulus-use) (debouncing, intersection/visibility, idle detection, and similar), its README notes that as an optional addition — it's worth knowing about as a general-purpose companion library even outside this site's controllers.
