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

## How content works

Component pages are generated from `../components/*/README.md` — there is no separate content to maintain. Adding a new controller to `components/` automatically adds it to the docs site on the next build.
