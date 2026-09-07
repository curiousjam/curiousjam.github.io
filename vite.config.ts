import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { seoSnapshotHtml, llmsTxt } from "./seo.ts";

const root = dirname(fileURLToPath(import.meta.url));

function writeLlmsTxt() {
  const text = llmsTxt();
  const plain = resolve(root, "public/llms.txt");
  const wellKnown = resolve(root, "public/.well-known/llms.txt");
  mkdirSync(dirname(wellKnown), { recursive: true });
  writeFileSync(plain, text);
  writeFileSync(wellKnown, text);
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "seo-snapshot",
      transformIndexHtml(html) {
        return html.replace(
          '<div id="root"></div>',
          `<div id="root">${seoSnapshotHtml()}</div>`,
        );
      },
    },
    {
      name: "llms-txt",
      buildStart() {
        writeLlmsTxt();
      },
    },
  ],
});
