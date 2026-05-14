/**
 * @description [zh-CN] 模板文件列表 — create 命令复制到用户项目的文件
 * @description [zh-TW] 範本檔案列表 — create 命令複製到使用者專案的檔案
 * @description [en] Template file list — files copied to user project by create command
 * @description [ja] テンプレートファイルリスト — create コマンドがユーザープロジェクトにコピーするファイル
 */

export const TEMPLATE_FILES = [
  // 配置文件
  "package.json",
  "tsconfig.json",
  "tsconfig.node.json",
  "vite.config.ts",
  "biome.json",
  "electron-builder.json5",
  ".gitignore",
  ".npmrc",

  // preload
  "preload/index.ts",

  // main-process/constant
  "main-process/constant/index.ts",

  // main-process/ipc
  "main-process/ipc/window.ts",
  "main-process/ipc/store.ts",
  "main-process/ipc/senders.ts",
  "main-process/ipc/index.ts",

  // main-process/windows
  "main-process/windows/main.ts",
  "main-process/windows/child-a.ts",
  "main-process/windows/devtools.ts",
  "main-process/windows/index.ts",

  // main-process/plugins
  "main-process/plugins/devtools/index.ts",

  // main-process/electron-store
  "main-process/electron-store/index.ts",

  // main-process/global-short-cut
  "main-process/global-short-cut/index.ts",

  // main-process/utils
  "main-process/utils/renderer-path.ts",

  // main-process entry
  "main-process/main.ts",

  // renderer-process/shared
  "renderer-process/shared/styles/index.css",
  "renderer-process/shared/services/ipc.ts",
  "renderer-process/shared/services/ipc.generated.ts",

  // renderer-process/windows/main
  "renderer-process/windows/main/App.tsx",
  "renderer-process/windows/main/main.tsx",
  "renderer-process/windows/main/index.html",

  // renderer-process/windows/child-a
  "renderer-process/windows/child-a/App.tsx",
  "renderer-process/windows/child-a/main.tsx",
  "renderer-process/windows/child-a/index.html",

  // renderer-process/windows/devtools
  "renderer-process/windows/devtools/App.tsx",
  "renderer-process/windows/devtools/main.tsx",
  "renderer-process/windows/devtools/index.html",

  // types
  "types/config/global.d.ts",
  "types/config/electron-store.d.ts",
];
