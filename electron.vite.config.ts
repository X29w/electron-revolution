import { defineConfig, externalizeDepsPlugin, swcPlugin } from "electron-vite";

import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(() => {
  return {
    main: {
      root: ".",
      plugins: [externalizeDepsPlugin(), swcPlugin()],
      resolve: {
        alias: {
          "@main": resolve("main-process"),
        },
      },
      build: {
        rollupOptions: {
          input: {
            index: resolve(__dirname, "main-process/index.ts"),
          },
        },
      },
    },
    preload: {
      root: ".",
      plugins: [externalizeDepsPlugin()],
      build: {
        rollupOptions: {
          input: {
            index: resolve(__dirname, "preload/index.ts"),
          },
        },
      },
    },
    renderer: {
      root: ".",
      plugins: [react()],
      resolve: {
        alias: {
          "@main": resolve("main-process"),
          "@render": resolve("render-process"),
        },
      },
      build: {
        sourcemap: true,
        rollupOptions: {
          input: {
            main: resolve(__dirname, "render-process/windows/main/index.html"),
            "child-a": resolve(__dirname, "render-process/windows/child-a/index.html"),
          },
        },
      },
    },
  };
});
