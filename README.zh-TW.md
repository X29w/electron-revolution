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

### 💡 這是什麼

Revolution 是一個**函數式、插件化**的 Electron 應用框架。

不同於傳統 Electron 模板專案，Revolution 的核心創新在於：

1. **🔌 插件化架構** — 所有功能以插件形式存在，支援熱插拔、依賴管理、插件間通訊
2. **🧠 IPC 型別零手寫** — 主程序寫 handler，一條命令自動生成渲染程序的完整型別
3. **🛠 CLI 程式碼生成** — 視窗、插件、IPC 模組一鍵生成，結構統一
4. **📦 純函數式設計** — 沒有類別，沒有裝飾器，模組化靠檔案組織而非語法糖

### 🚀 創新點

| 特性 | 傳統方案 | Revolution |
|------|----------|------------|
| IPC 型別 | 手寫 `.d.ts` 宣告檔，容易和實作不同步 | `pnpm gen:ipc` 從 handler 自動推導，零手寫 |
| 功能擴展 | 直接改主程序程式碼，耦合嚴重 | 插件系統，`definePlugin` + `setup` 函數 |
| 新增視窗 | 手動建立 5+ 個檔案，容易遺漏 | `pnpm add:window settings` 一條命令 |
| 程式碼組織 | 裝飾器 + 類別繼承，為了模式而模式 | 純函數 + 檔案模組，簡單直接 |
| 插件通訊 | 無標準方案 | EventBus + 插件 API 暴露 |

### 📁 專案結構

```
main-process/
├── core/                 # 🧱 框架核心
│   ├── ipc.ts            #    defineHandlers / defineListeners
│   ├── window.ts         #    視窗註冊與管理
│   ├── plugin.ts         #    插件生命週期
│   ├── event-bus.ts      #    事件匯流排
│   └── logger.ts         #    日誌
├── ipc/                  # 📡 IPC 模組（按功能拆分）
├── windows/              # 🪟 視窗工廠函數
├── plugins/              # 🔌 插件目錄
└── main.ts               # 🚪 入口

renderer-process/
├── shared/services/
│   └── ipc.generated.ts  # ⚙️ 自動生成的型別安全 IPC
└── windows/              # 📄 各視窗頁面

cli/                      # 🛠 CLI 工具
```

### 🔧 快速開始

```bash
pnpm install
pnpm dev
```

### 📋 CLI 命令

```bash
pnpm add:window settings      # 🪟 新增視窗
pnpm add:plugin file-manager  # 🔌 新增插件
pnpm add:ipc auth             # 📡 新增 IPC 模組
pnpm gen:ipc                  # ⚙️ 生成渲染程序 IPC 型別
pnpm cli create my-app        # 📦 建立新專案
```

### 🧩 核心用法

**定義 IPC（主程序）**

```ts
import { defineHandlers } from "../core/ipc";

export const userHandlers = defineHandlers({
  "user:get": (_, id: string) => ({ id, name: "test" }),
  "user:list": () => [{ id: "1", name: "test" }],
});
```

**渲染程序呼叫（自動生成型別）**

```ts
import { ipcInvoke } from "@renderer-process/shared/services/ipc";

const user = await ipcInvoke("user:get", "123");
// ✅ user 型別自動推導為 { id: string; name: string }
```

**定義插件**

```ts
import { definePlugin, defineHandlers } from "../../core";

export const myPlugin = definePlugin({
  meta: { name: "my-plugin", version: "1.0.0" },
  setup(ctx) {
    ctx.ipc(handlers.routes);
    ctx.command("my-plugin:run", () => ctx.log.info("running"));
    ctx.on("some-event", (data) => ctx.log.info(data));
  },
});
```

### 📖 開發流程

```
1. 寫 handler  →  defineHandlers({ "channel": handler })
2. 註冊        →  ipc/index.ts 中 registerRoutes()
3. 生成型別    →  pnpm gen:ipc
4. 渲染程序呼叫 →  ipcInvoke("channel", args) ← 完整型別提示
```

---

## 📄 License

MIT
