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
- Linter: ESLint v9 flat config (`eslint.config.js`) — `@eslint/js` recommended + `eslint-config-prettier` + `@vitest/eslint-plugin` (test files only); `docs/**` ignored
- Test framework: Vitest 4 + jsdom — `@hotwired/stimulus` is a devDep so controllers can be integration-tested by starting an `Application` in each test suite; scoped to `components/**/*.test.js`
- Pre-commit: Husky — `yarn format:check && yarn lint && yarn test:run`
- CI: `.github/workflows/ci.yml` — `check` job (format + lint + test) + parallel `docs` job (`npm ci && npm run build` in `docs/`)

## Docs site (`docs/`)

Static Astro 5 site deployed to [stimulus-snippets.dev](https://stimulus-snippets.dev).

- **Standalone npm project** — not part of the root Yarn workspace; use `npm` inside `docs/`, not `yarn`
- Content source: `components/*/README.md` via Astro content collection glob loader — no duplicated docs
- Dev server: `http://localhost:3130` (`npm run dev` inside `docs/`)
- Features: sidebar nav, light/dark/system theme toggle (anti-FOUC), GitHub link, Shiki dual-theme code blocks, controller file links rewritten to GitHub blob URLs via remark plugin
- Cloudflare Pages build settings: Root directory `docs`, Build command `npm ci && npm run build`, env var `SKIP_DEPENDENCY_INSTALL=true` (prevents Cloudflare auto-running `yarn install` due to root `yarn.lock`)

---

## Progress — 2026-06-16

### Completed

- **9 controllers shipped:** `dismiss`, `clipboard`, `password-reveal`, `character-count`, `password-rules`, `slug`, `checkbox-required`, `tabs`, `accordion`
- **115 tests** across 9 test files — Vitest + jsdom; full Stimulus `Application` integration pattern
- Vitest tooling wired in: `vitest.config.js`, `test`/`test:run` scripts, pre-commit + CI updated
- `@vitest/eslint-plugin` added so `describe`/`it`/`expect`/`vi` globals are recognized in test files
- MIT LICENSE added; `CODEOWNERS` (`* @craigmcn`) added; version bumped to `1.0.0`
- Root `README.md` updated: new components in the table; "Well-covered elsewhere" section listing mature third-party alternatives
- Initial commit pushed to `main` on `github.com/craigmcn/stimulus-snippets`
- Branch ruleset applied to `main` via `gh` CLI (1 required review, stale-review dismissal, `check` status check, no force-push/delete)
- **PR #1 merged** — bug fixes: `clipboard` navigator guard + timer debounce + disconnect; `checkbox-required` pristine-form init; `password-rules` RegExp guard
- **PR #2 merged** — docs site in `docs/` (Astro 5, Cloudflare Pages, stimulus-snippets.dev); dark/light/system theme toggle; CI docs job
- **PR #3 merged** (`fix/follow-up-cleanups`) — `slug` lock DOM-backed via `lockedValue`; `slug` README non-Latin note; `checkbox-required` `console.warn` when outside form; `console` + `KeyboardEvent` added to ESLint globals
- **PR #4 merged** (`feat/tabs-controller`) — `tabs` controller: full ARIA tablist, arrow-key nav, auto ID generation; addressed code review feedback from Claude and Copilot; 90 tests total
- DNS/email spoofing records (`SPF`, `DMARC`, `www` redirect) resolved in Cloudflare

### Key decisions

- **`_initValid()` vs. calling `validate()` from connect** — `validate()` has two jobs (set `data-valid` + toggle error target). Calling it raw from `connect()` showed errors before user interaction. Extracted `_initValid()` to do only the data-attribute write; `validate()` continues to manage error visibility on user events.
- **Blanket `.catch(() => {})` retained** — the `.then()` body contains no realistic throw paths, so a narrower catch would add complexity for no benefit. The guard before the call handles the only real crash path (undefined clipboard).
- **Docs site: monorepo in `docs/`** — Astro reads `components/*/README.md` directly; no duplicated content, no sync mechanism. Standalone npm project (not Yarn workspace) to allow `npm ci` on Cloudflare Pages.
- **Cloudflare Pages workflow** — must use Pages (not Worker) project type. Custom domains added through Pages dashboard only, not via manual DNS. `SKIP_DEPENDENCY_INSTALL=true` required because root `yarn.lock` causes Cloudflare to auto-run `yarn install` in `docs/`.
- **`slug` locked state uses `lockedValue`** — backed by `data-slug-locked-value` attribute so it survives controller reconnects (e.g. Turbo morphing). `connect()` only sets it when not already locked, so a reconnect with an empty output field doesn't un-lock a manually edited slug.
- **`checkbox-required` warns when outside a form** — `console.warn` on connect when `closest("form")` returns null; submit validation silently did nothing before.
- **`tabs` uses `_activate()` directly from action methods** — Stimulus value callbacks fire via MutationObserver (async); calling `_activate()` directly from `select()` and `keydown()` keeps UI updates synchronous and keeps tests simple. `indexValueChanged` is kept but guarded by `this._activated` so it only fires for external programmatic changes after connect.
- **`tabs` ID auto-generation uses module-level `uid` counter with collision check** — `do...while (document.getElementById(id))` skips any candidate already in the document; avoids `crypto.randomUUID()` churn on reconnect. On Vite HMR the counter resets but this is a development-only edge case.
- **`tabs` `_activate` clamps index** — out-of-bounds `data-tabs-index-value` (or programmatic set) is clamped to `[0, count-1]`; guard for empty tab list. Prevents the silent broken state where all panels hide and no tab is reachable.
- **`accordion` uses heading + button pattern, not `<details>`/`<summary>`** — `<details name>` covers single-open natively in 2026, but the ARIA accordion pattern (heading + `aria-expanded`) gives screen reader users heading-level navigation. Controller adds value where `<details>` can't: `aria-controls`/`aria-labelledby` wiring, arrow-key focus movement between triggers, and coordinated exclusive-open mode. `toggle()` called directly from action methods (not via value callback) so panel state updates are synchronous.
- **`accordion` exclusive enforcement runs on both connect and toggle** — if the page loads with multiple panels open and `exclusive` is true, all but the first open panel are closed on connect. This normalizes authoring mistakes without requiring JS-only initialization.

### Open PRs (pending merge)

- **PR #5** `feat/accordion-controller` — in progress; Copilot review addressed: extracted `_closePanel(index)` helper to eliminate duplicated exclusive-close logic between `connect()` and `toggle()`; PR description test count corrected (25, not 30); IME `isComposing` follow-up resolved as not actionable — triggers must be `<button>` elements so composition events cannot fire on them; if `keydown` is ever wired to a non-button element, add `if (event.isComposing) return` guard.

### Next components (planned)

1. `form-confirm` — `<dialog>`-based replacement for Rails 7's removed `data-confirm`
2. `file-preview` — thumbnail/filename before form submit (no canonical package)
3. `dependent-select` — client-side Country→State filtering
