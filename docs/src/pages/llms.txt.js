import { getCollection } from "astro:content";
import { parseComponent } from "../utils/component.js";

export async function GET() {
  const components = await getCollection("components");
  const items = components
    .map(parseComponent)
    .sort((a, b) => a.name.localeCompare(b.name));

  const lines = [
    "# stimulus-snippets",
    "",
    "> Copy-pasteable Stimulus JS controllers for Ruby on Rails. Inspired by shadcn/ui — not an installable package, just files you own.",
    "",
    "## What this is",
    "",
    "stimulus-snippets provides standalone, zero-dependency Stimulus JS controllers that Rails developers can copy directly into their app/javascript/controllers/ directory. Each controller is a single file with no build step required.",
    "",
    "## Controllers",
    "",
    ...items.map(
      ({ slug, name, description }) =>
        `- [${name} Controller](https://stimulus-snippets.dev/${slug}): ${description}`,
    ),
    "",
    "## Source",
    "",
    "- GitHub: https://github.com/craigmcn/stimulus-snippets",
    "- All controllers: https://stimulus-snippets.dev/all",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
