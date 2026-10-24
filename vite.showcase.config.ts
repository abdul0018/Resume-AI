import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

/** Examples-only showcase, bundled into a single self-contained page (see scripts/build-showcase.mjs). */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  publicDir: false,
  build: {
    outDir: "dist/showcase",
    emptyOutDir: true,
    target: ["es2020", "safari14", "chrome90"],
    cssTarget: ["safari14", "chrome90"],
    assetsInlineLimit: 100_000_000,
    rollupOptions: {
      input: path.resolve(__dirname, "showcase.html"),
      output: { inlineDynamicImports: true },
    },
  },
});
