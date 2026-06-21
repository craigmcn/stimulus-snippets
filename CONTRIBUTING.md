# Contributing

## Adding a component

1. Create a new folder under `components/[name]/`.
2. Add `[name]_controller.js` — the Stimulus controller.
3. Add `[name]_controller.test.js`, including an "accessibility" describe block that runs `getA11yViolations` (from `test/axe.js`) against the documented usage example from the README — see existing controllers' test files for the pattern.
4. Add `README.md` following the format below.

## Controller guidelines

- One controller, one job. If it does two things, split it.
- Use `static targets`, `static values`, and `static classes` — never query the DOM with `querySelector` when a target will do.
- Set `data-valid`, `data-active`, or similar data attributes on elements to communicate state; let CSS handle the visual.
- Add ARIA attributes in `connect()` only if the HTML author is unlikely to add them (e.g. `aria-live` on output elements).
- Avoid external dependencies. If `stimulus-use` genuinely saves significant code, note it as optional in the README.

## README format

Each component README should include:

1. **One-sentence description** — what it does, not how.
2. **Usage** — copy the file, register the controller (with code example).
3. **HTML** — one or more complete, copy-pasteable examples.
4. **API** — targets, values, and actions in a table.
5. **Accessibility notes** — ARIA roles, keyboard behaviour, screen reader considerations.

## Code style

Run `yarn format` and `yarn lint` before committing. The pre-commit hook enforces both.
