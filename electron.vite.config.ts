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
          "@main": resolve("main-thread"),
        },
      },
      build: {
        rollupOptions: {
          input: {
            index: resolve(__dirname, "main-thread/index.ts"),
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
          "@main": resolve("main-thread"),
          "@render": resolve("render-thread"),
        },
      },
      build: {
        sourcemap: true,
        rollupOptions: {
          input: {
            main: resolve(__dirname, "render-thread/main/index.html"),
            "child-a": resolve(__dirname, "render-thread/child-a/index.html"),
          },
        },
      },
    },
  };
});
