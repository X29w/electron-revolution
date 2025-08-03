import { defineConfig } from "vite";
import path, { resolve } from "node:path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";

console.log(
  "main path",
  path.join(__dirname, "renderer-process/window/main/index.html")
);

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: "dist/main.ts",
        vite: {
          build: {
            outDir: "dist/main-process",
            rollupOptions: {
              input: {
                index: resolve(__dirname, "main-process/main.ts"),
              },
              external: [
                "koa",
                "@koa/router",
                "typeorm",
                "sqlite3",
                "reflect-metadata",
              ],
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
        main: path.join(__dirname, "renderer-process/window/main/index.html"),
        setting: path.join(
          __dirname,
          "renderer-process/window/setting/index.html"
        ),
      },
      output: {
        // 可选：定义输出结构
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
