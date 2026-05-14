# ⚡ Revolution

<p align="center">
  <strong>函數式、插件化的 Electron 框架，零配置型別安全 IPC。</strong>
</p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README.zh-CN.md">简体中文</a> ·
  <a href="./README.zh-TW.md">繁體中文</a> ·
  <a href="./README.ja.md">日本語</a>
</p>

---

## Revolution 是什麼

Revolution 是一個 Electron 應用框架，採用不同的方式：

- **沒有類別，沒有裝飾器** — 純函數 + 檔案模組
- **IPC 型別從程式碼生成** — 寫一個 handler，跑一條命令，渲染程序自動獲得完整型別
- **插件系統** — 把功能封裝為可安裝/卸載的獨立單元
- **CLI 鷹架** — 一條命令生成視窗、插件、IPC 模組

---

## 快速開始

### 建立新專案

```bash
npx electron-revolution create my-app
cd my-app
pnpm install
pnpm dev
```

---

## CLI 命令

| 命令 | 作用 |
|------|------|
| `pnpm dev` | 啟動開發伺服器 |
| `pnpm build` | 生產建置 + electron-builder 打包 |
| `pnpm gen:ipc` | 從主程序 handler 生成渲染程序 IPC 型別 |
| `pnpm add:window <name>` | 生成新視窗（主程序 + 渲染程序） |
| `pnpm add:plugin <name>` | 生成新插件 |
| `pnpm add:ipc <name>` | 生成新 IPC 模組 |

---

## IPC 工作原理

| 方向 | 主程序 API | 渲染程序 API | 定義方式 |
|------|-----------|-------------|---------|
| 渲染 → 主（有回傳值） | `ipcMain.handle` | `ipcInvoke(channel, ...args)` | `defineHandlers` |
| 渲染 → 主（無回傳值） | `ipcMain.on` | `ipcSend(channel, ...args)` | `defineListeners` |
| 主 → 渲染 | `webContents.send` | `ipcOn(channel, listener)` | `defineSenders` |

### 定義 handler

```ts
import { defineHandlers, defineListeners } from "../core/ipc";

export const userHandlers = defineHandlers({
  "user:get": (_, id: string) => ({ id, name: "Alice" }),
});

export const userListeners = defineListeners({
  "user:delete": (_, id: string) => { console.log("delete:", id); },
});
```

### 生成型別 & 呼叫

```bash
pnpm gen:ipc
```

```ts
import { ipcInvoke } from "@renderer-process/shared/services/ipc";
const user = await ipcInvoke("user:get", "123");
// ✅ user: { id: string; name: string }
```

---

## 插件系統

插件是**獨立的功能模組**，可以註冊 IPC 路由、視窗、命令。

```ts
import { definePlugin, defineHandlers } from "../../core";

const handlers = defineHandlers({
  "screenshot:capture": () => "/path/to/file.png",
});

export const screenshotPlugin = definePlugin({
  meta: { name: "screenshot", version: "1.0.0" },
  setup(ctx) {
    ctx.ipc(handlers.routes);
    ctx.log.info("ready");
  },
});
```

安裝：

```ts
import { installPlugin } from "./core";
await installPlugin(screenshotPlugin);
```

### 插件上下文 API

| 方法 | 作用 |
|------|------|
| `ctx.ipc(routes)` | 註冊 IPC 路由（所有視窗都能呼叫） |
| `ctx.window(name, factory)` | 註冊新視窗 |
| `ctx.command(id, handler)` | 註冊命名命令 |
| `ctx.on / ctx.emit` | 內部事件通訊 |
| `ctx.use<T>(name)` | 存取其他插件的 API |
| `ctx.log` | 帶作用域的日誌 |

---

## 新增視窗

```bash
pnpm add:window settings
```

自動生成視窗工廠函數 + React 頁面 + HTML 範本。

---

## DevTools（僅開發環境）

內建除錯面板，記錄所有 IPC 呼叫（包括插件的），顯示插件狀態、視窗列表、記憶體使用。

---

## 技術棧

Electron 37 · Vite 6 · React 19 · TypeScript 5.9 · Tailwind CSS 4 · Biome · electron-builder

---

## 本地測試 CLI

```bash
pnpm link --global
revolution create test-app
cd test-app && pnpm install && pnpm dev
```

---

## License

MIT
