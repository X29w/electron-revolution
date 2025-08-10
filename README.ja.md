---
メインプロセスに Koa を搭載した最新の Electron フレームワーク** — TypeScript で動作し、Vite + React UI、モジュール式のメイン/プリロード/レンダラーアーキテクチャを備え、中規模から大規模デスクトップアプリに最適です。

[![Electron](https://img.shields.io/badge/Electron-20232A?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Koa](https://img.shields.io/badge/Koa-33333D?logo=node.js&logoColor=green)](https://koajs.com/)
[![React](https://img.shields.io/badge/React-20232A?logo=react& logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**言語:**
🌐 [英語](./README.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md)

---

## ✨ 機能

- **Electron + Koa** — メインプロセスは、API、ファイルシステム、データベース、内部ロジックを処理する Koa アプリを実行します。
- **完全な TypeScript** — main、preload、renderer 間で型を共有することで、一貫性のあるコントラクトを実現します。
- **モダンなフロントエンド** — 高速な HMR とコンポーネントベースの開発を実現する React + Vite。
- **モジュラーアーキテクチャ** — Koa ルートと IPC ハンドラーを独立したビジネスモジュールに分割します。
- **本番環境対応** — クロスプラットフォームビルド用の統合された`electron-builder`設定。

---

## 📂 プロジェクト構造

```

electron-revolution/
├── main-process/ # メインプロセス: Koa サーバー、IPC ハンドラー、ウィンドウ管理
│ ├── server/ # Koa コアとミドルウェア
│ ├── modules/ # ビジネスモジュール (CRUD / IPC / API)
│ └── database/ # データベースアクセス層 (TypeORM / SQLite)
├── preload/ # プリロードスクリプト (contextBridge 対応 API)
├── renderer-process/ # React + Vite フロントエンド
├── types/ # グローバル型定義
└── electronic-builder.\* # ビルド設定

```

---

## 🏗 アーキテクチャの原則

1. **バックエンドとしてのメインプロセス** — Koa は REST API、WebSocket、およびシステムレベルのロジックを処理します。
2. **IPC + HTTP** — セキュアな内部通信には IPC、汎用または外部アクセスには HTTP を使用します。
3. **モジュラービジネスロジック** — 各モジュールには、Koa ルート、IPC ハンドラー、およびデータアクセスが含まれます。
4. **プリロードセキュリティ** — `contextBridge` を介して、制御された API のみをレンダラーに公開します。

---

## 🚀 はじめに

```bash
git clone https://github.com/X29w/electron-revolution.git
cd electronic-revolution

# 依存関係をインストール
pnpm install

# 開発環境
pnpm dev

# 本番環境ビルド
pnpm build
pnpm run package
```

---

## 🧩 サンプルコード

**Koa ルートモジュール**

```ts
import Router from "koa-router";
const router = new Router({ prefix: "/user" });

router.get("/:id", async (ctx) => {
  const user = await ctx.db.user.findOne(ctx.params.id);
  ctx.body = user;
});

export default router;
```

**IPC ハンドラー**

```ts
import { ipcMain, BrowserWindow } from "electron";

ipcMain.handle("window:create", async (_, opts) => {
  const win = new BrowserWindow(opts);
  win.loadURL("...");
  return win.id;
});
```

**プリロード API**

```ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  createWindow: (opts) => ipcRenderer.invoke("window:create", opts),
});
```

---
