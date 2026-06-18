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
- A second `guides` content collection (`docs/src/content/guides/*.md`) holds standalone docs not tied to a specific controller (e.g. Rails + Stimulus setup); rendered at `/guides/[slug]` via the same markdown → Shiki pipeline as components, and listed in its own "Guides" sidebar section above "Components"
- Dev server: `http://localhost:3130` (`npm run dev` inside `docs/`)
- Features: sidebar nav, light/dark/system theme toggle (anti-FOUC), GitHub link, Shiki dual-theme code blocks, controller file links rewritten to GitHub blob URLs via remark plugin
- Cloudflare Pages build settings: Root directory `docs`, Build command `npm ci && npm run build`, env var `SKIP_DEPENDENCY_INSTALL=true` (prevents Cloudflare auto-running `yarn install` due to root `yarn.lock`)

---

## Progress — 2026-06-18

### Completed

- **11 controllers shipped:** `dismiss`, `clipboard`, `password-reveal`, `character-count`, `password-rules`, `slug`, `checkbox-required`, `tabs`, `accordion`, `form-confirm`, `search-filter`
- **135 tests** across 11 test files — Vitest + jsdom; full Stimulus `Application` integration pattern
- `search-filter` controller built — filters `item` targets against an `input` target's value via substring match on `textContent` (or an opt-in `data-search-filter-term` override), hides non-matches with the native `hidden` attribute, optional `empty` target gets `aria-live="polite"` auto-applied; 11 tests, README, Components table row
- **PR #12 merged** (`feat/search-filter-controller`) — the above; self-reviewed via `/review`, no blocking issues found
- `form-confirm` controller built (`<dialog>`-based replacement for Rails 7's removed `data-confirm`); PR #7 merged, self-reviewed, one real bug found and fixed before merge (see Key decisions)
- Researched and recorded 8 candidate components for future work (see "Candidate components" below), checked against stimulus-components.com, awesome-stimulusjs, and stimulush.com for overlap
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
- **PR #5 merged** (`feat/accordion-controller`) — `accordion` controller: ARIA disclosure pattern, arrow-key nav, exclusive-open mode; `_closePanel(index)` helper extracted per Copilot review; 115 tests total
- **PR #6 merged** (`feat/seo-discoverability`) — SEO and AI discoverability improvements to `docs/`
- DNS/email spoofing records (`SPF`, `DMARC`, `www` redirect) resolved in Cloudflare
- Docs site accent color changed from blue (`#2563eb`) to mustard/ochre (`#b45309` light / `#d29922` dark) — trialed against deep maroon/burgundy side-by-side in the running dev server before deciding
- Mustard accent extended beyond links/active nav to: wordmark (`.logo-primary`), active sidebar nav (inset accent stripe via `box-shadow`), component-card hover border, and `prose h2` underline (now 2px, accent-colored)
- `docs/public/favicon.svg` background updated from blue to mustard (`#b45309`) to match
- **PR #8 merged** (`feat/mustard-accent`) — the above mustard accent + favicon changes
- New "Setting up Rails with Stimulus" guide added (`docs/src/content/guides/getting-started.md`) — covers new vs. existing Rails apps, importmap vs. `jsbundling-rails` install paths, verifying the install, copying/registering a controller, smoke-testing, and common gotchas; new `guides` content collection + `/guides/[slug]` route + sidebar nav section; linked from root README's "How to use"
- Fixed `<pre>` code blocks blending into the page background in light mode — Shiki's light theme background (`#fff`) matched the page background exactly; forced a light-gray background (`var(--inline-code-bg)`) and added a subtle border in both themes for definition
- **PR #9 merged** (`docs/rails-setup-guide`) — the above guide + light-mode contrast fix
- Full-codebase review from a senior-Rails-developer perspective (all 10 controllers + docs): found one real bug (`form-confirm` submitter loss, see Key decisions) and two getting-started-guide gaps (layout script-tag check, CSP/importmap nonce gotcha) — both doc gaps folded into the same fix
- **PR #10 merged** (`fix/form-confirm-submitter`) — submitter-preservation fix + new multi-submit-button test (124 tests total) + the two guide additions above
- Docs site mobile/tablet responsive review: sidebar nav now collapses behind a hamburger toggle (`.sidebar-toggle`, `aria-expanded`) below 768px instead of stacking fully above content; added `nav + nav` margin so Guides/Components/All sections have visible separation; GitHub link + theme toggle shrunk and laid out as a compact row on mobile instead of full-width blocks; `.prose th { white-space: normal }` on mobile to stop API table headers from forcing horizontal page scroll
- **PR #13 opened** (`fix/mobile-docs-nav`) — the above mobile nav/table fixes
- `file-preview` controller built — previews selected files before form submit: image thumbnails via object URLs (revoked on re-render/disconnect), filename/size for everything else; `clear` action resets the whole selection; no per-file remove (`DataTransfer` FileList rebuilding is real-browser-only, no jsdom equivalent); 13 tests, README, Components table row
- **PR #14 opened** (`feat/file-preview-controller`) — the above; Copilot review caught two real issues fixed before merge: filename/size spans ran together with no separator in unstyled markup, and object-URL revocation wasn't covered by tests (see Key decisions)

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
- **Docs SEO/discoverability: `@astrojs/sitemap` + OG/JSON-LD + `/llms.txt` + `/all`** — sitemap auto-generated at build; OG/Twitter/JSON-LD (`WebSite` on home, `TechArticle` on controller pages) in `Layout.astro`; `/llms.txt` is a dynamic Astro endpoint (auto-updates as controllers are added); `/all` renders all READMEs in one page for LLM single-request reads. JSON-LD uses `Astro.site?.origin` (not a hardcoded string) and escapes `<` as `<` to prevent `</script>` breakout. Distribution tactics (community links, GitHub Topics) intentionally deferred.

- **`form-confirm` uses a single `_allowed` re-entry guard, not a separate "real" event** — `intercept()` preventDefault's and opens the dialog; `proceed()` sets the guard then calls `requestSubmit()`/`click()` on the original source element, so the same listener sees the replay and lets it through. Works for both form `submit` and link/button `click` without Turbo-specific code. Documented limitation: Turbo's `data-turbo-method` links bypass native form submission entirely, so they need `Turbo.setConfirmMethod()` instead — out of scope for a vanilla Stimulus controller.
- **`form-confirm` guards against double `showModal()` calls** — calling `showModal()` on an already-open `<dialog>` throws `InvalidStateError` in real browsers; this path is invisible to the test suite since jsdom doesn't implement `showModal` at all (confirmed by direct probe, not just absence in test output). `_open()` now checks `this.dialogTarget.open` first. Found via self-review of PR #7 before merge, not via test failure — worth remembering that this controller's dialog-open path is structurally undertested in jsdom and needs reasoning about real-browser behavior directly.
- **`form-confirm` preserves the clicked submit button across resubmit** — `requestSubmit()` with no argument resubmits via the form's default submitter, silently dropping which button was clicked. Broke the common Rails multi-submit-button pattern (`form.button "Save"` / `form.button "Save and add another"` sharing a `commit` name) — wrong value would reach the server after confirming. Fixed by capturing `event.submitter` in `intercept()` and passing it to `requestSubmit(submitter)` in `proceed()`. Found via a full-codebase senior-Rails-dev review (PR #10), not a test failure — same class of "real browser behavior, not exercised by the existing test fixtures" gap as the `showModal()` bug above.
- **Docs accent: mustard over maroon** — both were prototyped live in the dev server (swapping CSS variable values) before picking; mustard read as more distinctive than blue without the "alarm/error" connotation maroon risked. Decided via direct visual comparison, not by description alone.
- **`search-filter` plural-target iteration, no debounce** — `itemTargets` (plural) is always a safe empty-array default, so `filter()` needs no `hasItemTarget` guard before iterating; only the singular `inputTarget` access is guarded. No debounce added on the `input` action — full re-filter on every keystroke is cheap for typical Rails-page list sizes; flagged in review as a known scaling boundary, not a defect, consistent with the project's no-premature-complexity stance.
- **`file-preview` separates name/size with a literal text node, not CSS** — Copilot review on PR #14 caught that the generated `name`/`size` `<span>`s were appended with no whitespace between them, so default (unstyled) rendering ran them together (`"a.txt2.0 KB"`) — a real bug, since the README explicitly says no CSS is assumed. Fixed with a `" · "` text node between the spans rather than relying on a consumer's CSS.
- **`file-preview` object-URL revocation needed its own test** — the controller's most important resource-management behavior (revoking previous object URLs on re-render and on disconnect) had no assertion in the original test suite; same review caught this. Added `vi.spyOn(URL, "revokeObjectURL")` tests covering re-render, disconnect, and the no-image-files case — `URL.createObjectURL`/`revokeObjectURL` are real, spyable functions in jsdom (unlike `DataTransfer`, which jsdom doesn't implement at all), so this didn't hit the same real-vs-jsdom wall as the `form-confirm`/mobile-nav cases above.
- **Solved the headless-Chromium sandbox blocker — `channel: 'chrome'` instead of Playwright's bundled download.** Playwright's own Chromium download carries the macOS quarantine flag and fails to launch from a sandboxed shell (`spawn ... -88`); stripping quarantine is a denied security-weakening action. Launching against the already-Gatekeeper-cleared system Chrome (`chromium.launch({ channel: 'chrome' })`) sidesteps it entirely, no permission changes needed. Built a reusable global helper at `~/.claude/scripts/playwright-chrome/screenshot.js` (generic: takes URL/width/height/outfile/`--click`/`--full-page`, prints `horizontalScroll` + console errors as JSON) so this works across all projects, not just this one. Documented as a project skill at `docs/.claude/skills/screenshot-mobile/SKILL.md` so future sessions in this repo find it automatically via the `run` skill's project-skill lookup.
- **First mobile-nav fix attempt was verified only by static analysis and shipped a wrong root-cause guess** — without a real screenshot, guessed the horizontal-scroll cause was API-table `<th>` `white-space: nowrap` and added `white-space: normal` on mobile. Once the screenshot tooling above was built and used for real, this turned out to be wrong: actual cause was an unbreakable inline `<code>` token (e.g. `successDuration`) in a table _body_ cell forcing the table past viewport width — headers were never the problem. Real fix: `.prose table { display: block; overflow-x: auto; }` (mirrors the existing `.prose pre` overflow pattern), and the `th` mobile override was removed as ineffective. **Lesson: static CSS analysis caught the symptom category but guessed the wrong element; a real rendered screenshot found the actual offending node in one pass** — worth always reaching for the real browser check before describing a CSS-overflow fix as done.

### Open PRs (pending merge)

- **PR #13** (`fix/mobile-docs-nav`) — docs site mobile nav collapse, section spacing, de-emphasized GitHub/theme controls, table-header wrap fix; open, pending review
- **PR #14** (`feat/file-preview-controller`) — `file-preview` controller; open, pending review

### Next components (planned)

1. `dependent-select` — client-side Country→State filtering

### Candidate components (researched, not yet planned)

Checked against stimulus-components.com, awesome-stimulusjs, and stimulush.com (a paid component-library site whose pages only list category groupings, not concrete implementations) to avoid duplicating the README's "Well-covered elsewhere" list. None of these overlap shipped, planned, or well-covered-elsewhere controllers:

- `table-sort` — click a `<th>` to sort rows (string/number/date detection); distinct from drag-reorder `Sortable`. Medium effort, high value.
- `number-format` — live thousands-separator/currency formatting on an input, clean numeric value submitted via a hidden field. Medium effort, high value.
- `datetime-local` — converts a server-rendered UTC timestamp to the viewer's local time for display. Low-medium effort, high value.
- `row-select` — table row checkboxes with select-all, shift-click range, and a bulk-actions bar; goes beyond the existing all/none-only `checkbox-select-all` pattern. Medium effort, high value.
- `unsaved-changes` — warns via `beforeunload`/`turbo:before-visit` before navigating away from an edited form. Medium effort, medium-high value.
- `infinite-scroll` — loads the next page of a paginated/Turbo Stream list on scroll. Medium effort, medium value (Rails apps often prefer Turbo Frames/pagy links instead).
- `print-button` — triggers `window.print()`, optionally toggling print-only content first. Low effort, low-medium value (borderline whether it's worth a controller).
