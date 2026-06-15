# docs

Astro 5 documentation site for stimulus-snippets, deployed to [stimulus-snippets.dev](https://stimulus-snippets.dev).

**This subfolder is a standalone npm project** — it is not part of the root Yarn workspace. Use `npm` here, not `yarn`.

## Setup

```sh
cd docs
npm install
```

## Commands

```sh
npm run dev      # dev server at http://localhost:3100
npm run build    # static build → docs/dist/
npm run preview  # serve the built output locally
```

## Cloudflare Pages deployment

The root `yarn.lock` causes Cloudflare to auto-detect Yarn and run `yarn install` in `docs/`, which Yarn 4 rejects because `docs/` is not part of the root workspace. Two settings are required in the Cloudflare Pages project:

| Setting              | Value                              |
| -------------------- | ---------------------------------- |
| Build command        | `npm ci && npm run build`          |
| Environment variable | `SKIP_DEPENDENCY_INSTALL` = `true` |

`SKIP_DEPENDENCY_INSTALL` tells Cloudflare to skip its auto-detected install step. The build command then handles installation explicitly with npm.

Use the **Pages** workflow when creating the project in Cloudflare, not the Worker workflow. Custom domains must be added through the Pages project dashboard, not via manual DNS records.

## How content works

Component pages are generated from `../components/*/README.md` — there is no separate content to maintain. Adding a new controller to `components/` automatically adds it to the docs site on the next build.
