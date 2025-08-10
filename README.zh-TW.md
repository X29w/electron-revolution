---

## README.md（英文版範例）

```markdown
# electron-revolution 🚀

> **一個主進程中整合 Koa 的現代 Electron 框架** — 基於 TypeScript，Vite + React UI，模組化主程式/預先載入/渲染器架構，適用於中大型桌面應用。

[![Electron](https://img.shields.io/badge/Electron-20232A?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Koa](https://img.shields.io/badge/Koa-33333D?logo=node.js&logoColor=green)](https://koajs.com/)
[![React](https://img.shields.io/badge/React-20232A?logo=react& logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**語言：**
🌐 [英文](./README.md) | [繁體中文](./README.zh-TW.md) | [日文](./README.ja.md)

---

## ✨ 功能

- **Electron + Koa** — 主程序運行一個 Koa 應用，處理 API、檔案系統、資料庫和內部邏輯。
- **完整的 TypeScript** — 主程式、預先載入程式和渲染器之間共用類型，以實現一致的契約。
- **現代前端** — React + Vite，支援快速 HMR 和基於組件的開發。
- **模組化架構** — 將 Koa 路由和 IPC 處理程序拆分為獨立的業務模組。
- **生產就緒** — 整合 `electron-builder` 配置，支援跨平台建置。

---

## 📂 專案結構

```

electron-revolution/
── main-process/ # 主進程：Koa 伺服器、進程間通訊 (IPC) 處理程序、視窗管理
│ ── server/ # Koa 核心及中介軟體
│ ── modules/ # 業務模組 (CRUD / IPC / API)
│ └── database/ # 資料庫存取層 (TypeORM / SQLite)
── preload/ # 預先載入腳本 (contextBridge 安全 API)
── renderer-process/ # React + Vite 前端
── types/ # 全域類型定義
└── electron-builder.\* # 建置配置

```

---

## 🏗 架構原則

1. **主程序作為後端** — Koa 處理 REST API、WebSocket 和系統級邏輯。
2. **IPC + HTTP** — IPC 用於安全的內部通信，HTTP 用於通用或外部存取。
3. **模組化業務邏輯** — 每個模組都包含 Koa 路由、進程間通訊 (IPC) 處理程序和資料存取。
4. **預先載入安全性** — 僅透過 `contextBridge` 向渲染器公開受控的 API。

---

## 🚀 入門

『`bash
git clone https://github.com/X29w/electron-revolution.git
cd electron-revolution

# 安裝依賴項

pnpm install

# 開發環境

pnpm dev

# 建構生產環境

pnpm build
pnpm run package

````

---

## 🧩 範例程式碼

**Koa 路由模組**

```ts
import Router from "koa-router";
const router = new Router({ prefix: "/user" });

router.get("/:id", async (ctx) => {
const user = await ctx.db.user.findOne(ctx.params.id);
ctx.body = user;
});

export default router;
````

**IPC 處理程序**

```ts
從 "electron" 導入 { ipcMain, BrowserWindow };

ipcMain.handle("window:create", async (_, opts) => {
const win = new BrowserWindow(opts);
win.loadURL("...");
return win.id;
});
```

**預先載入 API**

```ts
從 "electron" 導入 { contextBridge, ipcRenderer };

contextBridge.exposeInMainWorld("api", {
createWindow: (opts) => ipcRenderer.invoke("window:create", opts),
});
```

---
