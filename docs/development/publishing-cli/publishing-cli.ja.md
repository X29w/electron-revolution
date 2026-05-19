# @x-elevolution/cli — ドキュメント

`@x-elevolution/cli` スキャフォールディングおよびコード生成ツールの完全なドキュメントです。

**バージョン：** 0.2.0  
**ライセンス：** MIT  
**インストール：** `npm install -g @x-elevolution/cli` または `npx @x-elevolution/cli` で使用

---

## 目次

- [概要](#概要)
- [インストール](#インストール)
- [コマンド](#コマンド)
  - [create](#x-elevolution-create-name)
  - [add window](#x-elevolution-add-window-name)
  - [add plugin](#x-elevolution-add-plugin-name)
  - [add ipc](#x-elevolution-add-ipc-name)
  - [gen:ipc](#x-elevolution-genipc)
- [テンプレートシステム](#テンプレートシステム)
- [`create` の内部動作](#create-の内部動作)
- [生成ファイルの詳細](#生成ファイルの詳細)
- [設定とフラグ](#設定とフラグ)
- [CLI の拡張](#cli-の拡張)

---

## 概要

`@x-elevolution/cli` は以下の機能を持つコード生成ツールです：

1. **完全な Electron プロジェクトのスキャフォールディング**（X-Elevolution アーキテクチャ）
2. **ウィンドウの生成**（メインプロセスファクトリ + レンダラーページ + HTML エントリー）
3. **プラグインの生成**（正しい構造とボイラープレート付き）
4. **IPC モジュールの生成**（ハンドラーとリスナーの定義付き）
5. **レンダラー IPC 型の自動生成**（メインプロセスのハンドラー定義に基づく）

CLI は繰り返しのセットアップ作業を排除し、一貫したプロジェクト構造を強制します。

---

## インストール

```bash
# npx で直接使用（推奨）
npx @x-elevolution/cli create my-app

# またはグローバルインストール
npm install -g @x-elevolution/cli
x-elevolution create my-app

# または開発依存としてインストール
pnpm add -D @x-elevolution/cli
```

---

## コマンド

### `x-elevolution create <name>`

完全で実行可能な Electron プロジェクトをスキャフォールドします。

```bash
x-elevolution create my-app
x-elevolution create my-app --local
```

**引数：**
- `<name>` — プロジェクトディレクトリ名（パッケージ名としても使用）

**フラグ：**
- `--local` — `@x-elevolution/core` を npm バージョンではなくローカル monorepo パスにリンク。開発用。

**生成される構造：**

```
my-app/
├── main-process/
│   ├── main.ts
│   ├── constant/index.ts
│   ├── ipc/
│   │   ├── index.ts
│   │   ├── store.ts
│   │   ├── senders.ts
│   │   └── window.ts
│   ├── plugins/
│   │   ├── devtools/index.ts
│   │   └── example-plugin/index.ts
│   ├── windows/
│   │   ├── index.ts
│   │   ├── main.ts
│   │   ├── child-a.ts
│   │   └── devtools.ts
│   ├── electron-store/index.ts
│   ├── global-short-cut/index.ts
│   └── utils/renderer-path.ts
├── renderer-process/
│   ├── shared/
│   │   ├── services/
│   │   │   ├── ipc.ts
│   │   │   └── ipc.generated.ts
│   │   └── styles/index.css
│   └── windows/
│       ├── main/
│       ├── child-a/
│       └── devtools/
├── preload/index.ts
├── types/
│   └── config/
│       ├── electron-store.d.ts
│       └── global.d.ts
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── biome.json
├── electron-builder.json5
└── .npmrc
```

---

### `x-elevolution add window <name>`

メインプロセスファクトリとレンダラーページを含む新しいウィンドウを生成します。

```bash
x-elevolution add window settings
x-elevolution add window file-browser
```

**引数：**
- `<name>` — ウィンドウ名（kebab-case）

**生成されるファイル：**

1. **`main-process/windows/<name>.ts`** — ウィンドウファクトリ関数
2. **`renderer-process/windows/<name>/App.tsx`** — React コンポーネント
3. **`renderer-process/windows/<name>/main.tsx`** — React エントリー
4. **`renderer-process/windows/<name>/index.html`** — HTML エントリー

---

### `x-elevolution add plugin <name>`

IPC ハンドラー、リスナー、正しい構造を含むプラグインスキャフォールドを生成します。

```bash
x-elevolution add plugin file-manager
x-elevolution add plugin auth
```

**引数：**
- `<name>` — プラグイン名（kebab-case）

**生成されるファイル：** `main-process/plugins/<name>/index.ts`

---

### `x-elevolution add ipc <name>`

ハンドラーとリスナーの定義を含む IPC モジュールを生成します。

```bash
x-elevolution add ipc user
x-elevolution add ipc notification
```

**引数：**
- `<name>` — モジュール名（kebab-case）

**生成されるファイル：** `main-process/ipc/<name>.ts`

---

### `x-elevolution gen:ipc`

メインプロセスのハンドラー実装からレンダラー IPC 型定義を自動生成します。

```bash
x-elevolution gen:ipc
```

**動作原理：**
1. `main-process/` 内のすべてのファイルで `defineHandlers` と `defineListeners` の呼び出しをスキャン
2. チャンネル名、引数の型、戻り値の型を抽出
3. `renderer-process/shared/services/ipc.generated.ts` を生成

---

## テンプレートシステム

CLI の `create` コマンドは monorepo 内のサンプルアプリ（`apps/electron-app/`）からファイルをコピーします。

### テンプレートファイルリスト

`packages/cli/template-files.ts` ファイルは、コピーするすべての相対パスを含む `TEMPLATE_FILES` 配列をエクスポートします。

### テンプレートの更新

スキャフォールドされたプロジェクトに含めるべきファイルをサンプルアプリに追加した場合：

1. `apps/electron-app/` にファイルを追加
2. `packages/cli/template-files.ts` の `TEMPLATE_FILES` に相対パスを追加
3. `x-elevolution create test-project --local` でテスト

### テンプレート変換

`create` 中に、CLI は `package.json` に以下の変換を適用します：
- `name` をプロジェクト名に設定
- `version` を `0.1.0` に設定
- `bin` フィールドを削除
- `dev` と `build` スクリプトのみ保持
- `@x-elevolution/core` 依存を `^0.2.0` に設定（`--local` 使用時はローカルリンク）

---

## 生成ファイルの詳細

### ウィンドウジェネレーターの命名

| 入力 | ファクトリ名 | コンポーネント名 |
|---|---|---|
| `settings` | `createSettingsWindow` | `Settings` |
| `file-browser` | `createFileBrowserWindow` | `FileBrowser` |
| `child-a` | `createChildAWindow` | `ChildA` |

変換ルール：
- ファクトリ：`create` + PascalCase(name) + `Window`
- コンポーネント：PascalCase(name)

### プラグインジェネレーターの命名

| 入力 | 変数名 |
|---|---|
| `file-manager` | `fileManagerPlugin` |
| `auth` | `authPlugin` |
| `devtools` | `devtoolsPlugin` |

変換ルール：camelCase(name) + `Plugin`

### IPC ジェネレーターの命名

| 入力 | Handlers 変数 | Listeners 変数 |
|---|---|---|
| `user` | `userHandlers` | `userListeners` |
| `file-system` | `fileSystemHandlers` | `fileSystemListeners` |

変換ルール：camelCase(name) + `Handlers` / `Listeners`

---

## 設定とフラグ

### グローバルフラグ

| フラグ | コマンド | 説明 |
|---|---|---|
| `--local` | `create` | core をローカル monorepo パスにリンク |
| `--help`, `-h` | 任意 | ヘルプ情報を表示 |

### 環境要件

CLI は `tsx` を使用して TypeScript を直接実行します。必要なもの：
- Node.js ≥ 20
- `tsx`（依存としてバンドル）
- `typescript`（依存としてバンドル）

---

## CLI の拡張

### 新しいコマンドの追加

1. `packages/cli/index.ts` にハンドラー関数を追加
2. switch 文に追加
3. `printHelp()` を更新

### ファイル書き込みユーティリティ

CLI は以下の内部ユーティリティを提供します：

```ts
write(path: string, content: string): void
toPascalCase(str: string): string
toCamelCase(str: string): string
ensureDir(dir: string): void
```

---

## パブリッシュ

### 公開前チェックリスト

- [ ] `template-files.ts` にサンプルアプリのすべてのファイルが含まれている
- [ ] すべてのジェネレーターが有効で実行可能なコードを生成する
- [ ] `gen:ipc` がハンドラー定義を正しく解析できる
- [ ] `create --local` が実行可能なプロジェクトを生成できる
- [ ] `create`（--local なし）が正しい npm バージョンを参照している
- [ ] `package.json` のバージョンが更新されている

### 公開コマンド

```bash
cd packages/cli
npm publish --access public
```