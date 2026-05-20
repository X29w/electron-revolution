# コントリビューターガイド

このガイドでは、`elevolution` monorepo のローカル開発、コード規約、パブリッシュワークフローについて説明します。

## 前提条件

- **Node.js** ≥ 20
- **pnpm** ≥ 9.15（`corepack enable` で有効化）
- **Git**

## リポジトリ構造

```
elevolution/
├── packages/
│   ├── core/          → @x-industry/elevolution-core（ランタイムフレームワーク、npm に公開）
│   └── cli/           → @x-industry/elevolution-cli（スキャフォールディングツール、npm に公開）
├── apps/
│   └── electron-app/  → サンプルアプリ（CLI テンプレートソースも兼ねる）
├── docs/              → ドキュメント
├── turbo.json         → Turborepo パイプライン設定
├── pnpm-workspace.yaml
└── package.json       → ワークスペースルート
```

## クイックスタート

```bash
# リポジトリをクローン
git clone https://github.com/user/elevolution.git
cd elevolution

# 依存関係をインストール
pnpm install

# 開発を開始（HMR 付きサンプルアプリを実行）
pnpm dev
```

`pnpm dev` コマンドは Turborepo を使用して `apps/electron-app` のサンプル Electron アプリを Vite HMR 有効で起動します。

## 開発ワークフロー

### `@x-industry/elevolution-core` の開発

core パッケージは `packages/core/` にあります。ビルドステップはなく、TypeScript ソースを直接エクスポートします（`"main": "./index.ts"` で消費）。

```bash
# サンプルアプリは workspace プロトコルで core を直接インポート
# packages/core/ への変更は実行中のアプリに即座に反映されます
pnpm dev
```

**モジュール構造：**

| ファイル | 責務 |
|---|---|
| `index.ts` | パブリックエクスポート（バレルファイル） |
| `ipc.ts` | IPC 定義、登録、ミドルウェア、インターセプター |
| `window.ts` | ウィンドウレジストリ、ライフサイクルフック、メッセージング |
| `plugin.ts` | プラグイン定義、インストール、コンテキスト、コマンド |
| `event-bus.ts` | プラグイン間通信用 EventBus |
| `logger.ts` | 置換可能なロガー（Proxy ベース） |
| `hot-reload.ts` | 開発環境でのプラグインホットリロード用ファイルウォッチャー |

**core に新機能を追加する：**

1. 関連するモジュールファイルを作成または変更
2. `index.ts` から新しいシンボルをエクスポート
3. 4 言語の JSDoc コメントを追加（zh-CN、zh-TW、en、ja）
4. サンプルアプリでテスト（`apps/electron-app`）
5. ドキュメントを更新

### `@x-industry/elevolution-cli` の開発

CLI パッケージは `packages/cli/` にあります。

```bash
# CLI をローカルでテスト
cd packages/cli
node bin.mjs create test-project --local

# またはワークスペースルートから
pnpm --filter @x-industry/elevolution-cli exec node bin.mjs --help
```

**モジュール構造：**

| ファイル | 責務 |
|---|---|
| `bin.mjs` | エントリーファイル（shebang、tsx 経由で index.ts をインポート） |
| `index.ts` | CLI ロジック — コマンドルーティング、ジェネレーター |
| `template-files.ts` | `create` コマンドがコピーするファイルリスト |
| `generate-ipc-types.ts` | `gen:ipc` の型生成ロジック |

**新しい CLI コマンドの追加：**

1. `index.ts` にコマンドハンドラー関数を追加
2. `switch (command)` ブロックに case を追加
3. `printHelp()` の出力を更新
4. コマンドがファイルを生成する場合、既存パターンに従ってジェネレーター関数を追加
5. `node bin.mjs <your-command>` でテスト

### サンプルアプリの開発

`apps/electron-app/` のサンプルアプリは二重の目的を持ちます：
- **開発サンドボックス**：core 機能のテスト用
- **テンプレートソース**：CLI の `create` コマンド用

サンプルアプリへの構造的な変更は `packages/cli/template-files.ts` に反映する必要があります。

## コード規約

### 関数型スタイル

本プロジェクトは純粋関数型スタイルを採用しています。クラスなし、デコレーターなし。

```ts
// ✅ 正しい
export const myFunction = (arg: string): Result => { ... };

// ❌ 間違い
export class MyService {
  constructor() { ... }
}
```

### 多言語コメント

すべてのパブリック向けコードには 4 言語の JSDoc コメントが必要です：

```ts
/**
 * @description [zh-CN] 中文简体描述
 * @description [zh-TW] 中文繁體描述
 * @description [en] English description
 * @description [ja] 日本語の説明
 */
export const myFunction = () => { ... };
```

### 命名規約

| 種類 | 規約 | 例 |
|---|---|---|
| 関数 | camelCase | `defineHandlers`, `registerRoutes` |
| 型/インターフェース | PascalCase | `IpcRoute`, `PluginContext` |
| 定数 | UPPER_SNAKE_CASE | `IS_DEV`, `PRELOAD_PATH` |
| ファイル | kebab-case | `event-bus.ts`, `hot-reload.ts` |
| IPC チャンネル | `namespace:action` | `"user:get"`, `"store:set"` |
| プラグイン名 | kebab-case | `"file-manager"`, `"devtools"` |

### エクスポートパターン

名前付きエクスポートのみ使用。デフォルトエクスポートは使用しない。

```ts
// ✅ 正しい
export const definePlugin = (def: PluginDef): PluginDef => def;

// ❌ 間違い
export default function definePlugin(def: PluginDef) { ... }
```

### 型エクスポート

型はその実装と一緒にエクスポートします：

```ts
export type IpcMiddleware = (...) => any;
export const useIpcMiddleware = (middleware: IpcMiddleware) => { ... };
```

## リンティングとフォーマット

プロジェクトは [Biome](https://biomejs.dev/) をリンティングとフォーマットに使用しています。

```bash
# リント
pnpm lint

# フォーマット（サンプルアプリ内で）
cd apps/electron-app
npx biome check --write .
```

Biome の設定は `apps/electron-app/biome.json` にあります。

## テスト

### 手動テスト

これは Electron フレームワークのため、ほとんどのテストはサンプルアプリの実行で行います：

```bash
pnpm dev
```

確認事項：
- IPC 呼び出しが正常に動作する（DevTools パネルで確認）
- プラグインが正しくロードされる（コンソール出力で確認）
- ウィンドウが正常に開閉する
- プラグインファイルの変更でホットリロードがトリガーされる

### CLI のテスト

```bash
# テストプロジェクトを作成
cd /tmp
node /path/to/packages/cli/bin.mjs create test-app --local
cd test-app
pnpm install
pnpm dev
```

## パブリッシュ

### バージョンアップ

2 つのパッケージは同期してバージョンアップする必要があります：

```bash
# 両方のパッケージのバージョンを更新
cd packages/core && npm version patch
cd packages/cli && npm version patch
```

### npm への公開

```bash
# まず core を公開（cli は概念的にこれに依存）
cd packages/core
npm publish --access public

# 次に cli を公開
cd packages/cli
npm publish --access public
```

### 公開前チェックリスト

- [ ] 新しくエクスポートされたシンボルに 4 言語のコメントが含まれている
- [ ] `packages/core/index.ts` がすべての新しいパブリックシンボルをエクスポートしている
- [ ] `packages/cli/template-files.ts` がサンプルアプリと同期している
- [ ] ドキュメントが更新されている（README + docs/）
- [ ] 両方の `package.json` ファイルのバージョン番号が更新されている
- [ ] サンプルアプリが `pnpm dev` で正常に実行できる
- [ ] `elevolution create test --local` が実行可能なプロジェクトを生成できる

## Turborepo パイプライン

`turbo.json` がビルドパイプラインを定義しています：

- `dev` — サンプルアプリを開発モードで起動
- `build` — すべてのパッケージをビルド（該当する場合）
- `lint` — ワークスペース全体でリンティングを実行

## Git ワークフロー

1. フィーチャーブランチを作成：`git checkout -b feat/my-feature`
2. コード規約に従って変更
3. サンプルアプリでテスト
4. コンベンショナルコミットを使用：`feat:`、`fix:`、`docs:`、`refactor:`
5. プッシュして Pull Request を作成

## トラブルシューティング

### `pnpm dev` でモジュールが見つからないエラー

```bash
# クリーンアップして再インストール
rm -rf node_modules apps/electron-app/node_modules packages/*/node_modules
pnpm install
```

### CLI `create` が古いファイルを生成する

`packages/cli/template-files.ts` を更新して、サンプルアプリに新しく追加されたファイルを含めてください。

### ホットリロードがトリガーされない

`IS_DEV` が `true` であること、プラグインが `installPluginHot`（`installPlugin` ではなく）でインストールされていることを確認してください。

### IPC 型が生成されない

プロジェクトルート（またはアプリディレクトリ）から `pnpm gen:ipc` を実行してください。すべてのハンドラーファイルが `@x-industry/elevolution-core` の `defineHandlers` / `defineListeners` を使用していることを確認してください。
