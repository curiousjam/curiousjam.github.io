import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { writeLlmsTxt } from "./seo.ts";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/app.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: (asset) =>
          asset.names?.some((name) => name.endsWith(".css"))
            ? "assets/app.css"
            : "assets/[name][extname]",
      },
    },
  },
  plugins: [
    react(),
    {
      name: "portfolio-llms-txt",
      buildStart() {
        writeLlmsTxt();
      },
    },
  ],
});
