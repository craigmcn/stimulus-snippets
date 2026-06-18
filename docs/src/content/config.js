import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const componentsBase = join(dir, "../../../components");

const components = defineCollection({
  loader: glob({ pattern: "*/README.md", base: componentsBase }),
});

const guides = defineCollection({
  loader: glob({ pattern: "*.md", base: join(dir, "guides") }),
});

export const collections = { components, guides };
