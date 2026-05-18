<p align="center">
  <h1 align="center">⚡ Electron Revolution</h1>
  <p align="center">純粋関数型・プラグインベースの Electron フレームワーク。型安全な IPC、ボイラープレートゼロ。</p>
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

## なぜ Revolution？

Electron アプリの構築は、ボイラープレート、安全でない IPC チャンネル、複雑なクラス階層との格闘であるべきではありません。Revolution は実際の開発の痛みから生まれました：

| 課題 | Revolution の解決策 |
|---|---|
| IPC チャンネルが文字列型で間違いやすい | **ハンドラーを一度書く → 型がレンダラーに自動生成** |
| クラスベースのフレームワークは硬直的でテストしにくい | **純粋関数型 — すべてアロー関数** |
| 機能追加に 5 つ以上のファイル変更が必要 | **プラグインシステム — 自己完結型、ホットリロード可能** |
| プロジェクトのセットアップに何時間もかかる | **1 コマンド → 完全に実行可能なプロジェクト** |
| 開発中に IPC トラフィックが見えない | **組み込み DevTools パネル（IPC 呼び出し、プラグイン状態、メモリ表示）** |

## クイックスタート

```bash
npx @revolution/cli create my-app
cd my-app
pnpm install
pnpm dev
```

これだけです。React、Vite HMR、型安全な IPC、プラグインシステムを備えた Electron アプリが動作しています。

![メインアプリケーション](../../readme/imgs/home.png)

## コアコンセプト

### 型安全な IPC（一度書けば、型はどこでも）

メインプロセスでハンドラーを定義：

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
    console.log("ユーザーがログアウトしました");
  },
});
```

ルートを登録：

```ts
// main-process/main.ts
import { registerRoutes } from "@revolution/core";
import { userHandlers, userListeners } from "./ipc/user";

registerRoutes(userHandlers.routes);
registerRoutes(userListeners.routes);
```

レンダラーの型を生成：

```bash
pnpm gen:ipc
```

レンダラーで完全な型安全性を享受：

```ts
// renderer — 型は自動生成済み！
const user = await ipcInvoke("user:get", "123");
//    ^? { id: string; name: string; email: string }
```

### プラグインシステム

プラグインは自己完結型のユニットで、IPC ルート、ウィンドウ、コマンドを登録し、イベントで通信できます：

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
    description: "ノートプラグイン",
  },
  setup(ctx) {
    ctx.ipc(handlers.routes);

    ctx.command("notes:clear-all", () => {
      ctx.log.info("すべてのノートをクリアしました");
    });

    ctx.on("app:ready", () => {
      ctx.log.info("ノートプラグイン準備完了");
    });

    // クリーンアップ関数（アンインストール時に呼ばれる）
    return () => {
      ctx.log.info("ノートプラグインを無効化しました");
    };
  },
});
```

メインプロセスでプラグインをインストール：

```ts
import { installPlugin } from "@revolution/core";
import { notesPlugin } from "./plugins/notes";

await installPlugin(notesPlugin);
```

### ウィンドウ管理

```ts
import { registerWindows, createWindow, sendToWindow, broadcastToWindows } from "@revolution/core";

// ウィンドウファクトリを登録
registerWindows({
  main: createMainWindow,
  settings: createSettingsWindow,
});

// オンデマンドでウィンドウを作成
const mainWin = createWindow("main");
const settingsWin = createWindow("settings");

// 特定のウィンドウにメッセージを送信
sendToWindow("main", "notification", { message: "こんにちは！" });

// すべてのウィンドウにブロードキャスト
broadcastToWindows("theme:changed", "dark");
```

![子ウィンドウ](../../readme/imgs/child-a.png)

### IPC ミドルウェアとインターセプター

```ts
import { useIpcMiddleware, addIpcInterceptor } from "@revolution/core";

// ミドルウェア — 呼び出しを傍受、変更、または中止可能
useIpcMiddleware((channel, type, args, next) => {
  const start = Date.now();
  const result = next();
  console.log(`[${channel}] ${Date.now() - start}ms かかりました`);
  return result;
});

// インターセプター — 軽量オブザーバー（変更不可）
const remove = addIpcInterceptor((channel, type) => {
  console.log(`IPC 呼び出し: ${channel} (${type})`);
});

// 後でインターセプターを削除
remove();
```

### EventBus（プラグイン間通信）

```ts
import { EventBus } from "@revolution/core";

EventBus.on("user:login", (user) => {
  console.log(`${user.name} がログインしました`);
});

EventBus.emit("user:login", { name: "Alice" });

EventBus.once("app:first-launch", () => {
  // 一度だけ実行
});
```

### 組み込み DevTools

フレームワークには組み込みの DevTools パネルが含まれており、IPC 呼び出し、プラグイン状態、アプリケーションメモリ使用量をリアルタイムで確認できます：

![DevTools パネル](../../readme/imgs/devtools.png)
![DevTools IPC モニタリング](../../readme/imgs/devtools2.png)

## CLI コマンド

| コマンド | 説明 |
|---|---|
| `revolution create <name>` | 完全なプロジェクトを作成 |
| `revolution create <name> --local` | ローカル core リンクでプロジェクトを作成（開発用） |
| `revolution add window <name>` | ウィンドウを生成（メインファクトリ + レンダラーページ） |
| `revolution add plugin <name>` | プラグインスキャフォールドを生成 |
| `revolution add ipc <name>` | IPC モジュールを生成（handlers + listeners） |
| `revolution gen:ipc` | ハンドラーからレンダラー IPC 型を自動生成 |

## プロジェクト構造（`create` 後）

````
my-app/
├── main-process/
│   ├── main.ts                  # エントリーポイント
│   ├── constant/index.ts        # 定数（IS_DEV、パスなど）
│   ├── ipc/
│   │   ├── index.ts             # IPC 登録
│   │   ├── store.ts             # Store ハンドラー
│   │   └── window.ts            # Window ハンドラー
│   ├── plugins/
│   │   ├── devtools/index.ts    # 組み込み DevTools プラグイン
│   │   └── example-plugin/      # サンプルプラグイン
│   ├── windows/
│   │   ├── index.ts             # ウィンドウレジストリ
│   │   ├── main.ts              # メインウィンドウファクトリ
│   │   └── devtools.ts          # DevTools ウィンドウファクトリ
│   └── utils/
├── renderer-process/
│   ├── shared/
│   │   ├── services/
│   │   │   ├── ipc.ts           # IPC invoke/send ヘルパー
│   │   │   └── ipc.generated.ts # 自動生成された型
│   │   └── styles/index.css     # Tailwind CSS
│   └── windows/
│       ├── main/                # メインウィンドウ UI
│       └── devtools/            # DevTools パネル UI
├── preload/index.ts             # プリロードスクリプト
├── types/                       # グローバル型宣言
├── vite.config.ts               # Vite マルチページ設定
├── tsconfig.json
└── package.json
````

## 拡張性

### Context 拡張

すべてのプラグインの context にカスタムフィールドを注入：

```ts
import { extendPluginContext } from "@revolution/core";
import Store from "electron-store";
import { dialog } from "electron";

const store = new Store();

extendPluginContext((ctx, meta) => {
  ctx.store = store;
  ctx.dialog = dialog;
});

// すべてのプラグインが ctx.store と ctx.dialog にアクセス可能
```

### カスタム Logger

組み込みの console logger を任意の実装に置換：

```ts
import { setLogger } from "@revolution/core";
import log from "electron-log";

setLogger(log);
// すべてのフレームワークとプラグインのログが electron-log を通じて出力
```

### プラグインホットリロード（開発モード）

```ts
import { installPluginHot } from "@revolution/core";
import { myPlugin } from "./plugins/my-plugin";

await installPluginHot(
  "./main-process/plugins/my-plugin",
  myPlugin,
  () => require("./plugins/my-plugin").myPlugin,
  process.env.NODE_ENV === "development"
);
// ファイル変更で自動的にプラグインがリロード
```

### ウィンドウライフサイクルフック

```ts
import { onWindowCreated, onWindowClosed } from "@revolution/core";

onWindowCreated((name, win) => {
  console.log(`ウィンドウ "${name}" が作成されました`);
  // すべてのウィンドウに動作を注入
});

onWindowClosed((name, win) => {
  console.log(`ウィンドウ "${name}" が閉じられました`);
});
```

## 技術スタック

| レイヤー | 技術 |
|---|---|
| ランタイム | Electron 37 |
| バンドラー | Vite 6 |
| UI | React 19 |
| 言語 | TypeScript 5.9 |
| スタイリング | Tailwind CSS 4 |
| リンター | Biome |
| パッケージング | electron-builder |
| モノレポ | Turborepo + pnpm workspaces |

## モノレポ構造

````
electron-revolution/
├── packages/
│   ├── core/     → @revolution/core（ランタイムフレームワーク）
│   └── cli/      → @revolution/cli（スキャフォールディングツール）
├── apps/
│   └── electron-app/  → サンプルアプリ & CLI テンプレート
├── docs/              → ドキュメント
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
````


## ライセンス

[MIT](./LICENSE)