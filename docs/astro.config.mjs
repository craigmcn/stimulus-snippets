import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://stimulus-snippets.dev",
  server: { port: 3100 },
  markdown: {
    shikiConfig: {
      theme: "github-dark",
    },
  },
});
