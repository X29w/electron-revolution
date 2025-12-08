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
              "@main-process": resolve("main-process"),
              "@preload": resolve("preload"),
            },
          },
          build: {
            outDir: "dist/main-process",
            rollupOptions: {
              input: {
                index: resolve(__dirname, "main-process/main.ts"),
              },
                external: [
          'bsdiff-node',
        ]
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
      "@preload": resolve("preload"),
      "@renderer-process": resolve("renderer-process"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "renderer-process/windows/main/index.html"),
        "child-a": resolve(
          __dirname,
          "renderer-process/windows/child-a/index.html"
        ),
      },
      external: [
        'bsdiff-node',
      ]
    },
  },
});
