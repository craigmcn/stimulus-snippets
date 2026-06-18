# Setting up Rails with Stimulus

Before copying any controller from this site, your Rails app needs Stimulus running. This is usually already true — Rails 7+ includes it by default — but here's how to check, and how to add it if it's missing.

## New Rails app

`rails new` has included Stimulus by default since Rails 7, via the `stimulus-rails` gem and `importmap-rails`. If you're starting fresh, there's nothing to install — skip to [Copying a controller](#copying-a-controller).

## Existing app: check if Stimulus is already set up

Look for `stimulus-rails` in your `Gemfile`:

```sh
bundle list | grep stimulus
```

If that prints `stimulus-rails`, you're set — skip to [Copying a controller](#copying-a-controller). If not, install it using whichever JavaScript setup your app already uses.

## Installing Stimulus (importmap — no Node build step)

This is the Rails 7+ default and the simplest option if your app doesn't already have a Node-based JS bundler.

```sh
bundle add stimulus-rails
bin/rails stimulus:install
```

This generates `app/javascript/controllers/application.js` and `app/javascript/controllers/index.js`, and pins `@hotwired/stimulus` in `config/importmap.rb`.

## Installing Stimulus (esbuild / webpack / rollup via jsbundling-rails)

If your app already bundles JS with `jsbundling-rails` (esbuild, webpack, or rollup), install Stimulus through npm/yarn instead so it ends up in the same bundle:

```sh
bundle add stimulus-rails
bin/rails stimulus:install
```

The generator detects `jsbundling-rails` and adds `@hotwired/stimulus` to `package.json` rather than `config/importmap.rb`. Run your usual install command (`yarn install` or `npm install`) afterward.

## Verifying the install

Two files matter:

```js
// app/javascript/controllers/application.js
import { Application } from "@hotwired/stimulus";

const application = Application.start();
application.debug = false;
window.Stimulus = application;

export { application };
```

```js
// app/javascript/controllers/index.js
import { application } from "controllers/application";

// Controllers get registered here, one import + register per controller.
```

And `app/javascript/application.js` (or your main JS entrypoint) should load the controllers index:

```js
import "controllers";
```

If `app/javascript/controllers/` doesn't exist at all, re-run `bin/rails stimulus:install` — it's safe to run again.

## Copying a controller

Once Stimulus is confirmed working, using any controller from this site is the same three steps regardless of which install path you took:

1. Copy the controller file into `app/javascript/controllers/`.
2. Register it in `app/javascript/controllers/index.js`.
3. Add `data-controller` and `data-action` attributes to your HTML.

```js
// app/javascript/controllers/index.js
import { application } from "controllers/application";
import DismissController from "./dismiss_controller";

application.register("dismiss", DismissController);
```

If you're on the importmap setup, also pin the file so the browser can resolve the import:

```ruby
# config/importmap.rb
pin "controllers/dismiss_controller", to: "controllers/dismiss_controller.js"
```

(`jsbundling-rails` apps don't need a pin — the bundler resolves the relative import automatically.)

## Smoke-testing it

Drop the controller's HTML example (each component's page on this site has one) into any view, then check the browser console:

- No `data-controller` warnings, and the behaviour described in the component's README works — you're done.
- A `Failed to autoload controller: dismiss` (or similar) message means the registration step was missed, or the importmap pin is missing/misspelled.

## Common gotchas

- **Naming mismatch.** `dismiss_controller.js` registers as `application.register("dismiss", ...)` and is referenced as `data-controller="dismiss"`. Stimulus derives the identifier from the registered name, not the filename — if they drift, double-check `index.js`.
- **Turbo and reconnects.** Turbo Drive swaps `<body>` content between page visits, which disconnects and reconnects controllers. Most controllers on this site handle that already (state is read from `data-*` attributes on `connect()`, not held only in memory) — but if you write your own, keep that pattern in mind.
- **Importmap cache in production.** After pinning a new controller, run `bin/rails importmap:install` is not needed again, but you do need a fresh asset precompile (`bin/rails assets:precompile`) so the new pin ships.
