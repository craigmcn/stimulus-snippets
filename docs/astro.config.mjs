import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

function remarkRewriteControllerLinks() {
  return (tree) => {
    function visit(node) {
      if (node.type === "link") {
        const match = node.url?.match(/^\.\/(.+_controller\.js)$/);
        if (match) {
          const filename = match[1];
          const slug = filename
            .replace("_controller.js", "")
            .replace(/_/g, "-");
          node.url = `https://github.com/craigmcn/stimulus-snippets/blob/main/components/${slug}/${filename}`;
        }
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}

export default defineConfig({
  site: "https://stimulus-snippets.dev",
  integrations: [sitemap()],
  server: { port: 3130 },
  markdown: {
    remarkPlugins: [remarkRewriteControllerLinks],
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
});
