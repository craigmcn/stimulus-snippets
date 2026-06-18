---
name: screenshot-mobile
description: Launch the stimulus-snippets docs site and take real headless-browser screenshots at mobile/tablet widths, using system Chrome to avoid macOS Gatekeeper quarantine issues with Playwright's bundled Chromium. Use when asked to check, verify, or screenshot the docs site's responsive/mobile layout.
---

# Screenshot the docs site at mobile/tablet widths

Use this whenever you need to actually _see_ the docs site (not just
read the CSS) — e.g. reviewing responsive layout, verifying a fix for
horizontal scroll, or checking the mobile nav.

## Why this exists

Playwright's default `chromium.launch()` downloads its own Chromium
into `~/Library/Caches/ms-playwright`, which macOS tags with the
`com.apple.quarantine` extended attribute. Launching it from a
sandboxed shell fails with `spawn Unknown system error -88` —
Gatekeeper blocking execution of a quarantined binary. Stripping the
quarantine flag is a security-weakening action and gets denied by the
permission classifier.

The fix: launch Playwright against the **system-installed Google
Chrome** instead (`channel: 'chrome'`). That binary was already
cleared through Gatekeeper the first time it was opened normally, so
there's no quarantine flag and no permission prompt.

## Steps

1. Make sure the docs dev server is running on port 3130:

   ```sh
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3130/ || \
     (cd docs && nohup npm run dev > /tmp/astro-dev.log 2>&1 & disown)
   ```

   Poll until it returns `200` before continuing.

2. Use the shared global helper script (works in any project, not just
   this one — installed once at `~/.claude/scripts/playwright-chrome/`):

   ```sh
   node ~/.claude/scripts/playwright-chrome/screenshot.js <url> <width> <height> <outfile> [--full-page] [--click "selector"]
   ```

   Common widths: `375 812` (iPhone), `768 1024` (tablet).

   Example — full-page screenshot of a component page at phone width:

   ```sh
   node ~/.claude/scripts/playwright-chrome/screenshot.js \
     http://localhost:3130/clipboard 375 812 /tmp/clipboard-mobile.png --full-page
   ```

   Example — open the mobile nav (click the hamburger) then screenshot:

   ```sh
   node ~/.claude/scripts/playwright-chrome/screenshot.js \
     http://localhost:3130/ 375 812 /tmp/nav-open.png --click "#sidebar-toggle"
   ```

3. The script prints JSON with `horizontalScroll` (bool, computed from
   `scrollWidth` vs `clientWidth`) and any browser `consoleErrors` —
   check this before even opening the screenshot; it catches overflow
   bugs the image alone might not make obvious.

4. Read the resulting PNG with the `Read` tool to actually look at it.

## Gotcha

Don't run `astro build` while `astro dev` is also running against the
same `docs/.astro` content cache — it corrupted the dev server's state
once (`UnknownFilesystemError` from Astro's content layer). If the dev
server errors after a build, restart it: `rm -rf docs/.astro && npm
run dev` (from `docs/`).
