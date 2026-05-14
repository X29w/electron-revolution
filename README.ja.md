# ⚡ Revolution

<p align="center">
  <strong>関数型・プラグインベースの Electron フレームワーク。ゼロ設定で型安全な IPC。</strong>
</p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README.zh-CN.md">简体中文</a> ·
  <a href="./README.zh-TW.md">繁體中文</a> ·
  <a href="./README.ja.md">日本語</a>
</p>

---

## Revolution とは

Revolution は Electron アプリケーションフレームワークで、異なるアプローチを取ります：

- **クラスなし、デコレータなし** — 純粋関数 + ファイルベースモジュール
- **IPC 型はコードから生成** — handler を書いてコマンド一つ実行すれば、レンダラーに完全な型が付く
- **プラグインシステム** — 機能をインストール/アンインストール可能な独立ユニットとして封装
- **CLI スキャフォールディング** — コマンド一つでウィンドウ、プラグイン、IPC モジュールを生成

---

## クイックスタート

### 新規プロジェクト作成

```bash
npx electron-revolution create my-app
cd my-app
pnpm install
pnpm dev
```

---

## CLI コマンド

| コマンド | 機能 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | プロダクションビルド + electron-builder パッケージング |
| `pnpm gen:ipc` | メインプロセスの handler からレンダラー IPC 型を生成 |
| `pnpm add:window <name>` | 新しいウィンドウを生成（メイン + レンダラー） |
| `pnpm add:plugin <name>` | 新しいプラグインを生成 |
| `pnpm add:ipc <name>` | 新しい IPC モジュールを生成 |

---

## IPC の仕組み

| 方向 | メインプロセス API | レンダラー API | 定義方法 |
|------|-------------------|---------------|---------|
| レンダラー → メイン（戻り値あり） | `ipcMain.handle` | `ipcInvoke(channel, ...args)` | `defineHandlers` |
| レンダラー → メイン（戻り値なし） | `ipcMain.on` | `ipcSend(channel, ...args)` | `defineListeners` |
| メイン → レンダラー | `webContents.send` | `ipcOn(channel, listener)` | `defineSenders` |

### handler の定義

```ts
import { defineHandlers, defineListeners } from "../core/ipc";

export const userHandlers = defineHandlers({
  "user:get": (_, id: string) => ({ id, name: "Alice" }),
});

export const userListeners = defineListeners({
  "user:delete": (_, id: string) => { console.log("delete:", id); },
});
```

### 型の生成 & 呼び出し

```bash
pnpm gen:ipc
```

```ts
import { ipcInvoke } from "@renderer-process/shared/services/ipc";
const user = await ipcInvoke("user:get", "123");
// ✅ user: { id: string; name: string }
```

---

## プラグインシステム

プラグインは**独立した機能モジュール**で、IPC ルート、ウィンドウ、コマンドを登録できます。

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

インストール：

```ts
import { installPlugin } from "./core";
await installPlugin(screenshotPlugin);
```

### プラグインコンテキスト API

| メソッド | 機能 |
|---------|------|
| `ctx.ipc(routes)` | IPC ルートを登録（全ウィンドウから呼び出し可能） |
| `ctx.window(name, factory)` | 新しいウィンドウを登録 |
| `ctx.command(id, handler)` | 名前付きコマンドを登録 |
| `ctx.on / ctx.emit` | 内部イベント通信 |
| `ctx.use<T>(name)` | 他のプラグインの API にアクセス |
| `ctx.log` | スコープ付きログ |

---

## ウィンドウの追加

```bash
pnpm add:window settings
```

ウィンドウファクトリ関数 + React ページ + HTML テンプレートを自動生成。

---

## DevTools（開発環境のみ）

組み込みデバッグパネル。全 IPC 呼び出し（プラグインのものを含む）を記録し、プラグイン状態、ウィンドウ一覧、メモリ使用量を表示。

---

## 技術スタック

Electron 37 · Vite 6 · React 19 · TypeScript 5.9 · Tailwind CSS 4 · Biome · electron-builder

---

## ローカル CLI テスト

```bash
pnpm link --global
revolution create test-app
cd test-app && pnpm install && pnpm dev
```

---

## License

MIT
