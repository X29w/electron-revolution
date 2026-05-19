# @x-elevolution/core — API リファレンス

`@x-elevolution/core` パッケージの完全な API ドキュメントです。

**バージョン：** 0.2.0  
**ライセンス：** MIT  
**インストール：** `pnpm add @x-elevolution/core`

---

## 目次

- [IPC モジュール](#ipc-モジュール)
  - [defineHandlers](#definehandlers)
  - [defineListeners](#definelisteners)
  - [defineSenders](#definesenders)
  - [registerRoutes](#registerroutes)
  - [unregisterRoutes](#unregisterroutes)
  - [useIpcMiddleware](#useipcmiddleware)
  - [addIpcInterceptor](#addipcinterceptor)
- [ウィンドウモジュール](#ウィンドウモジュール)
  - [registerWindow](#registerwindow)
  - [registerWindows](#registerwindows)
  - [unregisterWindow](#unregisterwindow)
  - [createWindow](#createwindow)
  - [getWindow](#getwindow)
  - [hasWindow](#haswindow)
  - [getRegisteredWindows](#getregisteredwindows)
  - [getAllWindows](#getallwindows)
  - [sendToWindow](#sendtowindow)
  - [broadcastToWindows](#broadcasttowindows)
  - [onWindowCreated](#onwindowcreated)
  - [onWindowClosed](#onwindowclosed)
- [プラグインモジュール](#プラグインモジュール)
  - [definePlugin](#defineplugin)
  - [installPlugin](#installplugin)
  - [uninstallPlugin](#uninstallplugin)
  - [extendPluginContext](#extendplugincontext)
  - [getPluginState](#getpluginstate)
  - [getInstalledPlugins](#getinstalledplugins)
  - [executeCommand](#executecommand)
- [EventBus](#eventbus)
- [ロガー](#ロガー)
  - [logger](#logger-インスタンス)
  - [setLogger](#setlogger)
- [ホットリロード](#ホットリロード)
  - [installPluginHot](#installpluginhot)
  - [stopAllHotReload](#stopallhotreload)
- [型定義](#型定義)


---

## IPC モジュール

インポート：`import { ... } from "@x-elevolution/core"` または `import { ... } from "@x-elevolution/core/ipc"`

### defineHandlers

IPC ハンドラーのセットを定義します（`ipcMain.handle` によるリクエスト-レスポンスパターン）。

```ts
const defineHandlers: <T extends Record<string, HandleFn>>(handlers: T) => {
  handlers: T;
  routes: IpcRoute[];
}
```

**パラメータ：**
- `handlers` — チャンネル名をハンドラー関数にマッピングするオブジェクト。各ハンドラーは `(event: IpcMainInvokeEvent, ...args)` を受け取り、値を返します。

**戻り値：** `handlers`（元のマッピング）と `routes`（登録用の `IpcRoute` 配列）を含むオブジェクト。

**例：**

```ts
import { defineHandlers } from "@x-elevolution/core";

export const fileHandlers = defineHandlers({
  "file:read": (event, path: string) => {
    return fs.readFileSync(path, "utf-8");
  },
  "file:write": (event, path: string, content: string) => {
    fs.writeFileSync(path, content);
    return { success: true };
  },
  "file:exists": (event, path: string) => {
    return fs.existsSync(path);
  },
});
```

### defineListeners

IPC リスナーのセットを定義します（`ipcMain.on` によるファイア・アンド・フォーゲットパターン）。

```ts
const defineListeners: <T extends Record<string, OnFn>>(listeners: T) => {
  listeners: T;
  routes: IpcRoute[];
}
```

**パラメータ：**
- `listeners` — チャンネル名をリスナー関数にマッピングするオブジェクト。各リスナーは `(event: IpcMainEvent, ...args)` を受け取り、戻り値はありません。

**戻り値：** `listeners`（元のマッピング）と `routes`（登録用の `IpcRoute` 配列）を含むオブジェクト。

**例：**

```ts
import { defineListeners } from "@x-elevolution/core";

export const appListeners = defineListeners({
  "app:log": (event, level: string, message: string) => {
    console.log(`[${level}] ${message}`);
  },
  "app:analytics": (event, eventName: string, data: Record<string, any>) => {
    analytics.track(eventName, data);
  },
});
```

### defineSenders

送信関数を定義します（メインプロセス → レンダラープロセス通信）。ドキュメントと型抽出のための型ヘルパーです。

```ts
const defineSenders: <T extends Record<string, (...args: any[]) => void>>(senders: T) => T
```

### registerRoutes

IPC ルートを Electron の `ipcMain` に登録します。登録されたすべてのルートにミドルウェアとインターセプターを適用します。

```ts
const registerRoutes: (routes: IpcRoute[]) => void
```

### unregisterRoutes

以前に登録した IPC ルートを削除します。

```ts
const unregisterRoutes: (routes: IpcRoute[]) => void
```

### useIpcMiddleware

IPC ミドルウェアを追加します。IPC 呼び出しを傍受、変更、または中止できます。ミドルウェアは追加順に実行されます。

```ts
const useIpcMiddleware: (middleware: IpcMiddleware) => void
```

**型：**
```ts
type IpcMiddleware = (
  channel: string,
  type: "handle" | "on",
  args: any[],
  next: () => any
) => any;
```

**パラメータ：**
- `middleware` — チャンネル名、型、引数、`next` 関数を受け取る関数。`next()` を呼び出してチェーンを続行するか、早期リターンで中止します。

**例：**

```ts
import { useIpcMiddleware } from "@x-elevolution/core";

// ロギングミドルウェア
useIpcMiddleware((channel, type, args, next) => {
  console.log(`[IPC] ${type} ${channel}`, args);
  return next();
});

// 認証ミドルウェア — 未認証の呼び出しをブロック
useIpcMiddleware((channel, type, args, next) => {
  if (channel.startsWith("admin:") && !isAdmin()) {
    throw new Error("Unauthorized");
  }
  return next();
});
```

### addIpcInterceptor

軽量な IPC オブザーバーを追加します。インターセプターは呼び出しを変更できません — 観察のみ可能です。インターセプターを削除する関数を返します。

```ts
const addIpcInterceptor: (interceptor: IpcInterceptor) => () => void
```

**型：**
```ts
type IpcInterceptor = (channel: string, type: "handle" | "on") => void;
```

**戻り値：** 呼び出し時にインターセプターを削除する関数。

---

## ウィンドウモジュール

インポート：`import { ... } from "@x-elevolution/core"` または `import { ... } from "@x-elevolution/core/window"`

### registerWindow

名前でウィンドウファクトリを登録します。

```ts
const registerWindow: (name: string, factory: WindowFactory) => void
```

**スロー：** 同名のウィンドウが既に登録されている場合エラーをスローします。

### registerWindows

複数のウィンドウファクトリを一度に登録します。

```ts
const registerWindows: (windows: Record<string, WindowFactory>) => void
```

### unregisterWindow

ウィンドウを登録解除します。ウィンドウインスタンスが存在し破棄されていない場合、閉じられます。

```ts
const unregisterWindow: (name: string) => void
```

### createWindow

登録されたファクトリからウィンドウインスタンスを作成します。`onWindowCreated` フックをトリガーし、`onWindowClosed` フックを設定します。

```ts
const createWindow: (name: string) => BrowserWindow
```

### getWindow

名前で既存のウィンドウインスタンスを取得します。

```ts
const getWindow: (name: string) => BrowserWindow | undefined
```

### hasWindow

ウィンドウインスタンスが存在するか確認します。

```ts
const hasWindow: (name: string) => boolean
```

### getRegisteredWindows

登録されたすべてのウィンドウ名を取得します（アクティブなインスタンスだけでなく）。

```ts
const getRegisteredWindows: () => string[]
```

### getAllWindows

すべてのアクティブなウィンドウインスタンスを Map として取得します。

```ts
const getAllWindows: () => Map<string, BrowserWindow>
```

### sendToWindow

特定のウィンドウのレンダラープロセスにメッセージを送信します。

```ts
const sendToWindow: (name: string, channel: string, ...args: any[]) => void
```

### broadcastToWindows

すべてのアクティブなウィンドウにメッセージを送信します。

```ts
const broadcastToWindows: (channel: string, ...args: any[]) => void
```

### onWindowCreated

ウィンドウが作成された後に実行されるフックを登録します。

```ts
const onWindowCreated: (hook: WindowHook) => void
```

### onWindowClosed

ウィンドウが閉じられた時に実行されるフックを登録します。

```ts
const onWindowClosed: (hook: WindowHook) => void
```

---

## プラグインモジュール

インポート：`import { ... } from "@x-elevolution/core"` または `import { ... } from "@x-elevolution/core/plugin"`

### definePlugin

プラグインを定義します。プラグイン定義に型チェックを提供する型恒等関数です。

```ts
const definePlugin: (def: PluginDef) => PluginDef
```

**型：**
```ts
interface PluginDef {
  meta: PluginMeta;
  setup: PluginSetup;
  api?: Record<string, any>;
}

interface PluginMeta {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
}

type PluginSetup = (ctx: PluginContext) => void | (() => void) | Promise<void | (() => void)>;
```

### installPlugin

プラグインをインストールして有効化します。依存関係を解決し、コンテキストを作成し、setup を実行します。

```ts
const installPlugin: (def: PluginDef) => Promise<void>
```

**動作：**
1. プラグインが既にインストールされているか確認（インストール済みの場合は警告して返す）
2. 依存関係がアクティブ状態か検証
3. すべての機能を持つ `PluginContext` を作成
4. コンテキストエクステンダーを適用
5. `setup()` 関数を実行
6. 返された場合はクリーンアップ関数を保存
7. 公開された API を登録
8. `"plugin:activated"` イベントを発行

**スロー：** 依存関係がアクティブ状態でない場合エラーをスローします。

### uninstallPlugin

プラグインをアンインストールします。クリーンアップ関数を実行し、IPC ルート、ウィンドウ、コマンドを削除します。

```ts
const uninstallPlugin: (name: string) => Promise<void>
```

### extendPluginContext

すべてのプラグインコンテキストにカスタムフィールドを注入します。エクステンダーは呼び出し後にインストールされるすべてのプラグインに適用されます。

```ts
const extendPluginContext: (extender: ContextExtender) => void
```

### getPluginState

プラグインの現在の状態を取得します。

```ts
const getPluginState: (name: string) => PluginState | undefined
```

**型：**
```ts
type PluginState = "active" | "inactive" | "error";
```

### getInstalledPlugins

インストールされたすべてのプラグインとその状態のリストを取得します。

```ts
const getInstalledPlugins: () => { name: string; version: string; state: PluginState }[]
```

### executeCommand

ID で登録されたプラグインコマンドを実行します。

```ts
const executeCommand: (id: string) => void
```

---

## EventBus

インポート：`import { EventBus } from "@x-elevolution/core"` または `import { EventBus } from "@x-elevolution/core/event-bus"`

プラグイン間通信、コマンドトリガー、ライフサイクルイベント用のグローバルイベントバスです。

### EventBus.on / off / emit / once / clear / onError

標準的なイベントバス API です。

### 組み込みイベント

フレームワークが自動的に発行するイベント：

| イベント | ペイロード | 説明 |
|---|---|---|
| `plugin:activated` | `name: string` | プラグインが正常にインストールされた後に発行 |
| `plugin:deactivated` | `name: string` | プラグインがアンインストールされた後に発行 |
| `command:<id>` | なし | `executeCommand(id)` が呼ばれた時に発行 |

---

## ロガー

インポート：`import { logger, setLogger } from "@x-elevolution/core"` または `import { ... } from "@x-elevolution/core/logger"`

### logger（インスタンス）

現在のロガーインスタンス。Proxy で実装されているため、`setLogger` でロガーを置換すると即座に反映されます。

**デフォルト動作：** `[x-elevolution]` プレフィックス付きでコンソールに出力。

### setLogger

ロガーの実装を置換します。すべてのフレームワークとプラグインのログが新しいロガーを使用します。

```ts
const setLogger: (newLogger: Logger) => void
```

---

## ホットリロード

インポート：`import { installPluginHot, stopAllHotReload } from "@x-elevolution/core"` または `import { ... } from "@x-elevolution/core/hot-reload"`

### installPluginHot

開発環境でのホットリロード用にファイル監視を有効にしてプラグインをインストールします。

```ts
const installPluginHot: (
  pluginDir: string,
  def: PluginDef,
  reloadFn: () => PluginDef,
  enabled?: boolean
) => Promise<void>
```

**パラメータ：**
- `pluginDir` — 監視するプラグインディレクトリのパス
- `def` — 最初にインストールするプラグイン定義
- `reloadFn` — 新しい `PluginDef` を返す関数（ファイル変更時に呼ばれる）
- `enabled` — 監視を有効にするか（デフォルト：`true`）。`IS_DEV` などを渡します。

### stopAllHotReload

すべてのアクティブなファイルウォッチャーを停止します。

```ts
const stopAllHotReload: () => void
```

---

## 型定義

エクスポートされたすべての型のリファレンス：

```ts
// IPC
export type IpcRoute = {
  type: "handle" | "on";
  channel: string;
  handler: (...args: any[]) => any;
};

export type IpcMiddleware = (
  channel: string,
  type: "handle" | "on",
  args: any[],
  next: () => any
) => any;

export type IpcInterceptor = (channel: string, type: "handle" | "on") => void;

// ウィンドウ
export type WindowFactory = () => BrowserWindow;
export type WindowHook = (name: string, win: BrowserWindow) => void;

// プラグイン
export interface PluginMeta {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
}

export interface PluginContext {
  ipc(routes: IpcRoute[]): void;
  window(name: string, factory: WindowFactory): void;
  command(id: string, handler: () => void | Promise<void>): void;
  on(event: string, handler: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  use<T = any>(pluginName: string): T | undefined;
  log: { info: (...args: any[]) => void; warn: (...args: any[]) => void; error: (...args: any[]) => void };
  [key: string]: any;
}

export type PluginSetup = (ctx: PluginContext) => void | (() => void) | Promise<void | (() => void)>;

export interface PluginDef {
  meta: PluginMeta;
  setup: PluginSetup;
  api?: Record<string, any>;
}

export interface Logger {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  [key: string]: any;
}
```

---

## サブパスエクスポート

パッケージはサブパスエクスポートによる細粒度インポートをサポートしています：

```ts
import { ... } from "@x-elevolution/core";          // すべて
import { ... } from "@x-elevolution/core/ipc";      // IPC のみ
import { ... } from "@x-elevolution/core/window";   // ウィンドウのみ
import { ... } from "@x-elevolution/core/plugin";   // プラグインのみ
import { EventBus } from "@x-elevolution/core/event-bus";
import { logger, setLogger } from "@x-elevolution/core/logger";
```