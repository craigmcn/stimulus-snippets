import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://stimulus-snippets.dev",
  markdown: {
    shikiConfig: {
      theme: "github-dark",
    },
  },
});
