# stimulus-snippets

Copy-pasteable Stimulus JS controllers for Ruby on Rails. Modelled after shadcn/ui — not an installable package, just files the user owns.

## What this is (and isn't)

- Vanilla JavaScript (no TypeScript, no React, no Vite)
- No build output — the `components/` folder is the deliverable
- No CSS — behaviour only; visual state communicated via `data-*` attributes

## Commands

```sh
yarn format          # Prettier write
yarn format:check    # Prettier check (pre-commit + CI)
yarn lint            # ESLint v9 flat config (pre-commit + CI)
yarn test            # Vitest watch mode
yarn test:run        # Vitest single run (pre-commit + CI)
```

Pre-commit hook runs `yarn format:check && yarn lint && yarn test:run`.  
CI (`.github/workflows/ci.yml`) runs the same three checks on Node 24.

## Project structure

```
components/
  [name]/
    [name]_controller.js        # Stimulus controller (the deliverable)
    [name]_controller.test.js   # Vitest tests
    README.md                   # Usage docs for this component
```

## Adding a component

1. Create `components/[name]/`.
2. Add `[name]_controller.js` — the Stimulus controller.
3. Add `[name]_controller.test.js` — Vitest tests (jsdom environment; use the Stimulus `Application` pattern — see existing tests for the `tick()` / connect setup).
4. Add `README.md` following the format in [CONTRIBUTING.md](CONTRIBUTING.md).
5. Add a row to the Components table in the root [README.md](README.md).

## Controller guidelines

- One controller, one job. Split if it does two things.
- Prefer `static targets`, `static values`, `static classes` over `querySelector`.
- Communicate state via `data-*` attributes on elements; let CSS handle visuals.
- Add ARIA attributes in `connect()` only when the HTML author is unlikely to (e.g. `aria-live` on output elements).
- Avoid external dependencies. If `stimulus-use` genuinely saves code, note it as optional.

## Component README format

1. One-sentence description — what it does, not how.
2. Usage — copy the file, register the controller (with code example).
3. HTML — one or more complete, copy-pasteable examples.
4. API — targets, values, and actions in a table.
5. Accessibility notes — ARIA roles, keyboard behaviour, screen reader considerations.

## Tooling notes

- Package manager: Yarn 4.14.1 via Corepack (`yarn@4.14.1` in `package.json`)
- `.yarnrc.yml` — clean: `nodeLinker: node-modules` only (no `enableScripts` / `approvedGitRepositories`)
- Formatter: Prettier with all defaults (`.prettierrc` is `{}`)
- Linter: ESLint v9 flat config (`eslint.config.js`) — `@eslint/js` recommended + `eslint-config-prettier` + `@vitest/eslint-plugin` (test files only)
- Test framework: Vitest 4 + jsdom — `@hotwired/stimulus` is a devDep so controllers can be integration-tested by starting an `Application` in each test suite
- Pre-commit: Husky — `yarn format:check && yarn lint && yarn test:run`

---

## Progress — 2026-06-15

### Completed

- **7 controllers shipped:** `dismiss`, `clipboard`, `password-reveal`, `character-count`, `password-rules`, `slug`, `checkbox-required`
- **64 tests** across 7 test files — Vitest + jsdom; full Stimulus `Application` integration pattern
- Vitest tooling wired in: `vitest.config.js`, `test`/`test:run` scripts, pre-commit + CI updated
- `@vitest/eslint-plugin` added so `describe`/`it`/`expect`/`vi` globals are recognized in test files
- Bug fixed in `password-reveal`: label toggling logic was inverted (`isPassword` / `!isPassword` were swapped on `showLabel` / `hideLabel`)
- `toSlug` exported from `slug_controller.js` for direct unit testing
- MIT LICENSE added; `CODEOWNERS` (`* @craigmcn`) added; version bumped to `1.0.0`
- Root `README.md` updated: new components in the table; "Well-covered elsewhere" section listing mature third-party alternatives
- Initial commit pushed to `main` on `github.com/craigmcn/stimulus-snippets`
- Branch ruleset applied to `main` via `gh` CLI (1 required review, stale-review dismissal, `check` status check, no force-push/delete)

### Bug fixes — PR #1 (`fix/review-findings`, open)

Four confirmed bugs fixed across two rounds of review (Claude `/code-review high` + GitHub Copilot):

- **`clipboard`: `navigator.clipboard` guard** — `if (!navigator.clipboard) return;` at top of `copy()`; the `.catch()` does not intercept the synchronous `TypeError` thrown in non-HTTPS contexts
- **`clipboard`: rapid-copy timer debounce** — `clearTimeout(this._timer)` before creating a new timer so double-clicks don't orphan the previous callback and hide feedback early
- **`clipboard`: `disconnect()` added** — `clearTimeout(this._timer)` on disconnect prevents timer firing on a detached element after Turbo Drive navigation
- **`checkbox-required`: separate init from error display** — `_initValid()` sets `data-valid` on connect without touching the error target, so pristine forms don't show validation errors before user interaction; `validate()` (called on submit/change) still manages error target visibility
- **`password-rules`: `new RegExp()` guarded** — `try/catch` prevents a malformed `data-pattern` from aborting the entire `forEach`; `Number.isNaN` guard added for empty `data-min` attribute
- **Tests strengthened** — disconnect test now asserts `feedback.hidden` stays false after timer elapses (required flushing MutationObserver micro-task with `await Promise.resolve()` before `vi.advanceTimersByTime()`); 3 new clipboard tests; 1 new checkbox-required test; 1 new password-rules test

### Key decisions

- **`_initValid()` vs. calling `validate()` from connect** — `validate()` has two jobs (set `data-valid` + toggle error target). Calling it raw from `connect()` showed errors before user interaction. Extracted `_initValid()` to do only the data-attribute write; `validate()` continues to manage error visibility on user events.
- **Blanket `.catch(() => {})` retained** — the `.then()` body contains no realistic throw paths (`hasFeedbackTarget`, `.hidden`, `setTimeout`), so a narrower DOMException-only catch would add complexity for no practical benefit. The guard before the call handles the only real crash path (undefined clipboard).
- **MutationObserver micro-task flush** — with `vi.useFakeTimers()`, Stimulus's disconnect() is triggered by a MutationObserver callback (micro-task). An `await Promise.resolve()` is needed after `remove()` before advancing fake timers to ensure `clearTimeout` runs first.

### Lower-priority follow-ups

- `slug`: document that non-Latin scripts (CJK, Arabic, emoji) produce an empty string — README-only change
- `slug`: `this.locked` has no DOM backing and resets if the controller reconnects after the output is cleared
- `checkbox-required`: no `console.warn` when the element is not inside a `<form>` — silent no-op is confusing

### Next components (planned)

See the research plan for full prioritized list. Top picks:

1. `tabs` — full ARIA tablist + arrow-key navigation (gap in existing packages)
2. `accordion` — `aria-expanded` + optional single-open mode
3. `form-confirm` — `<dialog>`-based replacement for Rails 7's removed `data-confirm`
4. `file-preview` — thumbnail/filename before form submit (no canonical package)
5. `dependent-select` — client-side Country→State filtering
