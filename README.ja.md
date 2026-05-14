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

### 💡 これは何か

Revolution は**関数型・プラグインベース**の Electron アプリケーションフレームワークです。

従来の Electron テンプレートとは異なり、以下の点で革新しています：

1. **🔌 プラグインアーキテクチャ** — 全機能がプラグインとして存在し、ホットスワップ・依存管理・プラグイン間通信をサポート
2. **🧠 IPC 型の自動推論** — メインプロセスで handler を書くだけで、コマンド一つでレンダラーの型を自動生成
3. **🛠 CLI コード生成** — ウィンドウ、プラグイン、IPC モジュールをコマンド一つで生成
4. **📦 純粋関数型設計** — クラスなし、デコレータなし、ファイル構成によるモジュール化

### 🚀 イノベーション

| 機能 | 従来の方法 | Revolution |
|------|-----------|------------|
| IPC 型 | `.d.ts` を手書き、実装と乖離しやすい | `pnpm gen:ipc` で handler から自動推論 |
| 機能拡張 | メインプロセスを直接変更、密結合 | プラグインシステム `definePlugin` + `setup` |
| ウィンドウ追加 | 5つ以上のファイルを手動作成 | `pnpm add:window settings` コマンド一つ |
| コード構成 | デコレータ + クラス継承 | 純粋関数 + ファイルモジュール |
| プラグイン通信 | 標準的な方法なし | EventBus + プラグイン API 公開 |

### 📁 プロジェクト構造

```
main-process/
├── core/                 # 🧱 フレームワークコア
│   ├── ipc.ts            #    defineHandlers / defineListeners
│   ├── window.ts         #    ウィンドウ登録・管理
│   ├── plugin.ts         #    プラグインライフサイクル
│   ├── event-bus.ts      #    イベントバス
│   └── logger.ts         #    ログ
├── ipc/                  # 📡 IPC モジュール（機能別）
├── windows/              # 🪟 ウィンドウファクトリ関数
├── plugins/              # 🔌 プラグインディレクトリ
└── main.ts               # 🚪 エントリーポイント

renderer-process/
├── shared/services/
│   └── ipc.generated.ts  # ⚙️ 自動生成された型安全 IPC
└── windows/              # 📄 各ウィンドウページ

cli/                      # 🛠 CLI ツール
```

### 🔧 クイックスタート

```bash
pnpm install
pnpm dev
```

### 📋 CLI コマンド

```bash
pnpm add:window settings      # 🪟 ウィンドウ追加
pnpm add:plugin file-manager  # 🔌 プラグイン追加
pnpm add:ipc auth             # 📡 IPC モジュール追加
pnpm gen:ipc                  # ⚙️ レンダラー IPC 型生成
pnpm cli create my-app        # 📦 新規プロジェクト作成
```

### 🧩 基本的な使い方

**IPC 定義（メインプロセス）**

```ts
import { defineHandlers } from "../core/ipc";

export const userHandlers = defineHandlers({
  "user:get": (_, id: string) => ({ id, name: "test" }),
  "user:list": () => [{ id: "1", name: "test" }],
});
```

**レンダラーから呼び出し（型は自動生成）**

```ts
import { ipcInvoke } from "@renderer-process/shared/services/ipc";

const user = await ipcInvoke("user:get", "123");
// ✅ user の型は { id: string; name: string } と自動推論
```

**プラグイン定義**

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

### 📖 開発フロー

```
1. handler を書く  →  defineHandlers({ "channel": handler })
2. 登録する        →  ipc/index.ts で registerRoutes()
3. 型を生成する    →  pnpm gen:ipc
4. レンダラーで呼ぶ →  ipcInvoke("channel", args) ← 完全な型ヒント
```

---

## 📄 License

MIT
