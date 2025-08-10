---
A modern Electron framework with Koa in the main process — TypeScript powered, Vite + React UI, modular main/preload/renderer architecture, ready for mid-to-large scale desktop apps.

[![Electron](https://img.shields.io/badge/Electron-20232A?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Koa](https://img.shields.io/badge/Koa-33333D?logo=node.js&logoColor=green)](https://koajs.com/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Languages:**
🌐 [English](./README.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md)
---

## ✨ Features

- **Electron + Koa** — Main process runs a Koa app handling APIs, file system, database, and internal logic.
- **Full TypeScript** — Shared types between main, preload, and renderer for consistent contracts.
- **Modern Frontend** — React + Vite with fast HMR and component-based development.
- **Modular Architecture** — Split Koa routes and IPC handlers into isolated business modules.
- **Production Ready** — Integrated `electron-builder` config for cross-platform builds.

---

## 📂 Project Structure

```

electron-revolution/
├── main-process/ # Main process: Koa server, IPC handlers, window management
│ ├── server/ # Koa core & middlewares
│ ├── modules/ # Business modules (CRUD / IPC / API)
│ └── database/ # Database access layer (TypeORM / SQLite)
├── preload/ # Preload scripts (contextBridge safe APIs)
├── renderer-process/ # React + Vite frontend
├── types/ # Global type definitions
└── electron-builder.\* # Build configuration

```

---

## 🏗 Architecture Principles

1. **Main Process as Backend** — Koa handles REST APIs, WebSocket, and system-level logic.
2. **IPC + HTTP** — IPC for secure internal communication, HTTP for generic or external access.
3. **Modular Business Logic** — Each module contains Koa routes, IPC handlers, and data access.
4. **Preload Security** — Only expose controlled APIs to renderer via `contextBridge`.

---

## 🚀 Getting Started

```bash
git clone https://github.com/X29w/electron-revolution.git
cd electron-revolution

# Install dependencies
pnpm install

# Development
pnpm dev

# Build production
pnpm build
pnpm run package
```

---

## 🧩 Example Code

**Koa Route Module**

```ts
import Router from "koa-router";
const router = new Router({ prefix: "/user" });

router.get("/:id", async (ctx) => {
  const user = await ctx.db.user.findOne(ctx.params.id);
  ctx.body = user;
});

export default router;
```

**IPC Handler**

```ts
import { ipcMain, BrowserWindow } from "electron";

ipcMain.handle("window:create", async (_, opts) => {
  const win = new BrowserWindow(opts);
  win.loadURL("...");
  return win.id;
});
```

**Preload API**

```ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  createWindow: (opts) => ipcRenderer.invoke("window:create", opts),
});
```

---
