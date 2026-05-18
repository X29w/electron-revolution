<p align="center">
  <h1 align="center">⚡ Electron Revolution</h1>
  <p align="center">純函數式、插件化的 Electron 框架，型別安全的 IPC，零樣板程式碼。</p>
</p>

<p align="center">
  <a href="../../README.md">English</a> |
  <a href="./README.zh-CN.md">简体中文</a> |
  <a href="./README.zh-TW.md">繁體中文</a> |
  <a href="./README.ja.md">日本語</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-37-47848F?logo=electron" alt="Electron 37" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="TypeScript 5.9" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite 6" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

---

## 為什麼選擇 Revolution？

建構 Electron 應用不應該意味著與樣板程式碼、不安全的 IPC 通道或糾纏的類別層次結構搏鬥。Revolution 誕生於真實的開發痛點：

| 痛點 | Revolution 的解決方案 |
|---|---|
| IPC 通道是字串型別，容易出錯 | **寫一次 handler → 型別自動生成到渲染程序** |
| 基於類別的框架僵硬且難以測試 | **純函數式 — 全程箭頭函數** |
| 新增功能需要修改 5+ 個檔案 | **插件系統 — 自包含、可熱重載的單元** |
| 專案搭建需要數小時 | **一條命令 → 完整可執行專案** |
| 開發時無法觀察 IPC 流量 | **內建 DevTools 面板，展示 IPC 呼叫、插件狀態、記憶體** |

## 快速開始

```bash
npx @revolution/cli create my-app
cd my-app
pnpm install
pnpm dev
```

就這樣。你已經擁有一個執行中的 Electron 應用，包含 React、Vite HMR、型別安全的 IPC 和即用的插件系統。

## 核心概念

### 型別安全的 IPC（寫一次，型別到處用）

在主程序中定義 handler：

```ts
// main-process/ipc/user.ts
import { defineHandlers, defineListeners } from "@revolution/core";

export const userHandlers = defineHandlers({
  "user:get": (event, id: string) => {
    return { id, name: "Alice", email: "alice@example.com" };
  },
  "user:list": (event, page: number, limit: number) => {
    return { users: [], total: 0 };
  },
});

export const userListeners = defineListeners({
  "user:logout": (event) => {
    console.log("使用者已登出");
  },
});
```

註冊路由：

```ts
// main-process/main.ts
import { registerRoutes } from "@revolution/core";
import { userHandlers, userListeners } from "./ipc/user";

registerRoutes(userHandlers.routes);
registerRoutes(userListeners.routes);
```

生成渲染程序型別：

```bash
pnpm gen:ipc
```

在渲染程序中使用，享受完整型別安全：

```ts
// renderer — 型別已自動生成！
const user = await ipcInvoke("user:get", "123");
//    ^? { id: string; name: string; email: string }
```

### 插件系統

插件是自包含的單元，可以註冊 IPC 路由、視窗、命令，並透過事件通訊：

```ts
import { definePlugin, defineHandlers } from "@revolution/core";

const handlers = defineHandlers({
  "notes:create": (_, title: string, content: string) => {
    return { id: crypto.randomUUID(), title, content };
  },
});

export const notesPlugin = definePlugin({
  meta: {
    name: "notes",
    version: "1.0.0",
    description: "筆記插件",
  },
  setup(ctx) {
    ctx.ipc(handlers.routes);

    ctx.command("notes:clear-all", () => {
      ctx.log.info("所有筆記已清除");
    });

    ctx.on("app:ready", () => {
      ctx.log.info("筆記插件就緒");
    });

    // 清理函數（卸載時呼叫）
    return () => {
      ctx.log.info("筆記插件已停用");
    };
  },
});
```

在主程序中安裝插件：

```ts
import { installPlugin } from "@revolution/core";
import { notesPlugin } from "./plugins/notes";

await installPlugin(notesPlugin);
```

### 視窗管理

```ts
import { registerWindows, createWindow, sendToWindow, broadcastToWindows } from "@revolution/core";

// 註冊視窗工廠
registerWindows({
  main: createMainWindow,
  settings: createSettingsWindow,
});

// 按需建立視窗
const mainWin = createWindow("main");
const settingsWin = createWindow("settings");

// 向指定視窗發送訊息
sendToWindow("main", "notification", { message: "你好！" });

// 向所有視窗廣播
broadcastToWindows("theme:changed", "dark");
```

### IPC 中介軟體與攔截器

```ts
import { useIpcMiddleware, addIpcInterceptor } from "@revolution/core";

// 中介軟體 — 可以攔截、修改或終止呼叫
useIpcMiddleware((channel, type, args, next) => {
  const start = Date.now();
  const result = next();
  console.log(`[${channel}] 耗時 ${Date.now() - start}ms`);
  return result;
});

// 攔截器 — 輕量觀察者（不能修改呼叫）
const remove = addIpcInterceptor((channel, type) => {
  console.log(`IPC 呼叫: ${channel} (${type})`);
});

// 之後移除攔截器
remove();
```

### EventBus（插件間通訊）

```ts
import { EventBus } from "@revolution/core";

EventBus.on("user:login", (user) => {
  console.log(`${user.name} 已登入`);
});

EventBus.emit("user:login", { name: "Alice" });

EventBus.once("app:first-launch", () => {
  // 只執行一次
});
```

## CLI 命令

| 命令 | 描述 |
|---|---|
| `revolution create <name>` | 建立完整專案 |
| `revolution create <name> --local` | 建立專案並連結本地 core（開發用） |
| `revolution add window <name>` | 生成視窗（主程序工廠 + 渲染程序頁面） |
| `revolution add plugin <name>` | 生成插件骨架 |
| `revolution add ipc <name>` | 生成 IPC 模組（handlers + listeners） |
| `revolution gen:ipc` | 從 handlers 自動生成渲染程序 IPC 型別 |

## 專案結構（`create` 之後）

```
my-app/
├── main-process/
│   ├── main.ts                  # 進入點
│   ├── constant/index.ts        # 常數（IS_DEV、路徑等）
│   ├── ipc/
│   │   ├── index.ts             # IPC 註冊
│   │   ├── store.ts             # Store handlers
│   │   └── window.ts            # Window handlers
│   ├── plugins/
│   │   ├── devtools/index.ts    # 內建 DevTools 插件
│   │   └── example-plugin/      # 範例插件
│   ├── windows/
│   │   ├── index.ts             # 視窗註冊表
│   │   ├── main.ts              # 主視窗工廠
│   │   └── devtools.ts          # DevTools 視窗工廠
│   └── utils/
├── renderer-process/
│   ├── shared/
│   │   ├── services/
│   │   │   ├── ipc.ts           # IPC invoke/send 輔助函數
│   │   │   └── ipc.generated.ts # 自動生成的型別
│   │   └── styles/index.css     # Tailwind CSS
│   └── windows/
│       ├── main/                # 主視窗 UI
│       └── devtools/            # DevTools 面板 UI
├── preload/index.ts             # 預載入腳本
├── types/                       # 全域型別宣告
├── vite.config.ts               # Vite 多頁面設定
├── tsconfig.json
└── package.json
```

## 可擴展性

### Context 擴展

向所有插件的 context 注入自訂欄位：

```ts
import { extendPluginContext } from "@revolution/core";
import Store from "electron-store";
import { dialog } from "electron";

const store = new Store();

extendPluginContext((ctx, meta) => {
  ctx.store = store;
  ctx.dialog = dialog;
});

// 現在每個插件都可以存取 ctx.store 和 ctx.dialog
```

### 自訂 Logger

用任意實作替換內建的 console logger：

```ts
import { setLogger } from "@revolution/core";
import log from "electron-log";

setLogger(log);
// 所有框架和插件日誌現在透過 electron-log 輸出
```

### 插件熱重載（開發模式）

```ts
import { installPluginHot } from "@revolution/core";
import { myPlugin } from "./plugins/my-plugin";

await installPluginHot(
  "./main-process/plugins/my-plugin",
  myPlugin,
  () => require("./plugins/my-plugin").myPlugin,
  process.env.NODE_ENV === "development"
);
// 檔案變化自動觸發插件重載
```

### 視窗生命週期鉤子

```ts
import { onWindowCreated, onWindowClosed } from "@revolution/core";

onWindowCreated((name, win) => {
  console.log(`視窗 "${name}" 已建立`);
  // 向所有視窗注入行為
});

onWindowClosed((name, win) => {
  console.log(`視窗 "${name}" 已關閉`);
});
```

## 技術棧

| 層級 | 技術 |
|---|---|
| 執行環境 | Electron 37 |
| 建構工具 | Vite 6 |
| UI 框架 | React 19 |
| 語言 | TypeScript 5.9 |
| 樣式 | Tailwind CSS 4 |
| 程式碼檢查 | Biome |
| 打包 | electron-builder |
| Monorepo | Turborepo + pnpm workspaces |

## Monorepo 結構

```
electron-revolution/
├── packages/
│   ├── core/     → @revolution/core（執行時框架）
│   └── cli/      → @revolution/cli（腳手架工具）
├── apps/
│   └── electron-app/  → 範例應用 & CLI 範本
├── docs/              → 文件
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## 貢獻

請參閱 [docs/guide.md](./docs/guide.md) 了解貢獻者指南，包括本地開發、程式碼規範和發佈流程。

## 授權條款

[MIT](./LICENSE)
