import { defineConfig } from "vite";
import path, { resolve } from "node:path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    electron({
      main: {
        entry: "main-process/main.ts",
        vite: {
          resolve: {
            alias: {
              "@revolution/core": resolve("main-process/core/index.ts"),
              "@main-process": resolve("main-process"),
            },
          },
          build: {
            outDir: "dist/main-process",
            rollupOptions: {
              input: {
                index: resolve(__dirname, "main-process/main.ts"),
              },
            },
          },
        },
      },
      preload: {
        input: path.join(__dirname, "preload/index.ts"),
        vite: {
          build: {
            outDir: "dist/preload",
          },
        },
      },
      renderer: {},
    }),
  ],
  resolve: {
    alias: {
      "@main-process": resolve("main-process"),
      "@renderer-process": resolve("renderer-process"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "renderer-process/windows/main/index.html"),
        "child-a": resolve(
          __dirname,
          "renderer-process/windows/child-a/index.html",
        ),
        devtools: resolve(
          __dirname,
          "renderer-process/windows/devtools/index.html",
        ),
      },
    },
  },
});
