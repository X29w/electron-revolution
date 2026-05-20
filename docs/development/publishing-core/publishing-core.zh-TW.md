# @x-industry/elevolution-core — API 參考文件

`@x-industry/elevolution-core` 套件的完整 API 文件。

**版本：** 0.2.0  
**授權條款：** MIT  
**安裝：** `pnpm add @x-industry/elevolution-core`

---

## 目錄

- [IPC 模組](#ipc-模組)
  - [defineHandlers](#definehandlers)
  - [defineListeners](#definelisteners)
  - [defineSenders](#definesenders)
  - [registerRoutes](#registerroutes)
  - [unregisterRoutes](#unregisterroutes)
  - [useIpcMiddleware](#useipcmiddleware)
  - [addIpcInterceptor](#addipcinterceptor)
- [視窗模組](#視窗模組)
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
- [插件模組](#插件模組)
  - [definePlugin](#defineplugin)
  - [installPlugin](#installplugin)
  - [uninstallPlugin](#uninstallplugin)
  - [extendPluginContext](#extendplugincontext)
  - [getPluginState](#getpluginstate)
  - [getInstalledPlugins](#getinstalledplugins)
  - [executeCommand](#executecommand)
- [EventBus](#eventbus)
- [日誌器](#日誌器)
  - [logger](#logger-實例)
  - [setLogger](#setlogger)
- [熱重載](#熱重載)
  - [installPluginHot](#installpluginhot)
  - [stopAllHotReload](#stopallhotreload)
- [型別定義](#型別定義)


---

## IPC 模組

匯入方式：`import { ... } from "@x-industry/elevolution-core"` 或 `import { ... } from "@x-industry/elevolution-core/ipc"`

### defineHandlers

定義一組 IPC 處理器（透過 `ipcMain.handle` 實現請求-回應模式）。

```ts
const defineHandlers: <T extends Record<string, HandleFn>>(handlers: T) => {
  handlers: T;
  routes: IpcRoute[];
}
```

**參數：**
- `handlers` — 將通道名稱對映到處理函數的物件。每個處理器接收 `(event: IpcMainInvokeEvent, ...args)` 並回傳一個值。

**回傳值：** 包含 `handlers`（原始對映）和 `routes`（用於註冊的 `IpcRoute` 陣列）的物件。

**範例：**

```ts
import { defineHandlers } from "@x-industry/elevolution-core";

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

定義一組 IPC 監聽器（透過 `ipcMain.on` 實現即發即忘模式）。

```ts
const defineListeners: <T extends Record<string, OnFn>>(listeners: T) => {
  listeners: T;
  routes: IpcRoute[];
}
```

**參數：**
- `listeners` — 將通道名稱對映到監聽函數的物件。每個監聽器接收 `(event: IpcMainEvent, ...args)` 且無回傳值。

**回傳值：** 包含 `listeners`（原始對映）和 `routes`（用於註冊的 `IpcRoute` 陣列）的物件。

**範例：**

```ts
import { defineListeners } from "@x-industry/elevolution-core";

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

定義傳送函數（主程序 → 渲染程序通訊）。這是一個僅用於文件和型別提取的型別輔助函數。

```ts
const defineSenders: <T extends Record<string, (...args: any[]) => void>>(senders: T) => T
```

**範例：**

```ts
import { defineSenders } from "@x-industry/elevolution-core";

export const appSenders = defineSenders({
  "app:notification": (title: string, body: string) => {},
  "app:theme-changed": (theme: "light" | "dark") => {},
});
```

### registerRoutes

將 IPC 路由註冊到 Electron 的 `ipcMain`。對所有註冊的路由套用中介軟體和攔截器。

```ts
const registerRoutes: (routes: IpcRoute[]) => void
```

**參數：**
- `routes` — `IpcRoute` 物件陣列（來自 `defineHandlers` 或 `defineListeners`）。

**範例：**

```ts
import { registerRoutes } from "@x-industry/elevolution-core";
import { fileHandlers } from "./ipc/file";
import { appListeners } from "./ipc/app";

registerRoutes(fileHandlers.routes);
registerRoutes(appListeners.routes);
```

### unregisterRoutes

移除之前註冊的 IPC 路由。

```ts
const unregisterRoutes: (routes: IpcRoute[]) => void
```

**參數：**
- `routes` — 要註銷的 `IpcRoute` 物件陣列。

**範例：**

```ts
import { unregisterRoutes } from "@x-industry/elevolution-core";
import { fileHandlers } from "./ipc/file";

// 移除所有檔案處理器
unregisterRoutes(fileHandlers.routes);
```

### useIpcMiddleware

新增 IPC 中介軟體，可以攔截、修改或中止 IPC 呼叫。中介軟體按新增順序執行。

```ts
const useIpcMiddleware: (middleware: IpcMiddleware) => void
```

**型別：**
```ts
type IpcMiddleware = (
  channel: string,
  type: "handle" | "on",
  args: any[],
  next: () => any
) => any;
```

**參數：**
- `middleware` — 接收通道名稱、型別、參數和 `next` 函數的函數。呼叫 `next()` 繼續鏈式呼叫，或提前回傳以中止。

**範例：**

```ts
import { useIpcMiddleware } from "@x-industry/elevolution-core";

// 日誌中介軟體
useIpcMiddleware((channel, type, args, next) => {
  console.log(`[IPC] ${type} ${channel}`, args);
  return next();
});

// 驗證中介軟體——阻止未授權呼叫
useIpcMiddleware((channel, type, args, next) => {
  if (channel.startsWith("admin:") && !isAdmin()) {
    throw new Error("Unauthorized");
  }
  return next();
});

// 計時中介軟體
useIpcMiddleware((channel, type, args, next) => {
  const start = performance.now();
  const result = next();
  const duration = performance.now() - start;
  if (duration > 100) {
    console.warn(`[IPC] Slow call: ${channel} (${duration.toFixed(1)}ms)`);
  }
  return result;
});
```

### addIpcInterceptor

新增輕量級 IPC 觀察器。攔截器不能修改呼叫——只能觀察。回傳一個用於移除攔截器的函數。

```ts
const addIpcInterceptor: (interceptor: IpcInterceptor) => () => void
```

**型別：**
```ts
type IpcInterceptor = (channel: string, type: "handle" | "on") => void;
```

**回傳值：** 呼叫時移除攔截器的函數。

**範例：**

```ts
import { addIpcInterceptor } from "@x-industry/elevolution-core";

// 追蹤 IPC 呼叫頻率
const callCounts = new Map<string, number>();

const remove = addIpcInterceptor((channel, type) => {
  callCounts.set(channel, (callCounts.get(channel) ?? 0) + 1);
});

// 之後：停止觀察
remove();
```

---

## 視窗模組

匯入方式：`import { ... } from "@x-industry/elevolution-core"` 或 `import { ... } from "@x-industry/elevolution-core/window"`

### registerWindow

按名稱註冊單個視窗工廠。

```ts
const registerWindow: (name: string, factory: WindowFactory) => void
```

**型別：**
```ts
type WindowFactory = () => BrowserWindow;
```

**拋出：** 如果同名視窗已註冊則拋出錯誤。

**範例：**

```ts
import { registerWindow } from "@x-industry/elevolution-core";

registerWindow("settings", () => {
  return new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: { preload: PRELOAD_PATH },
  });
});
```

### registerWindows

一次註冊多個視窗工廠。

```ts
const registerWindows: (windows: Record<string, WindowFactory>) => void
```

**範例：**

```ts
import { registerWindows } from "@x-industry/elevolution-core";

registerWindows({
  main: createMainWindow,
  settings: createSettingsWindow,
  about: createAboutWindow,
});
```

### unregisterWindow

註銷一個視窗。如果視窗實例存在且未被銷毀，將會被關閉。

```ts
const unregisterWindow: (name: string) => void
```

### createWindow

從已註冊的工廠建立視窗實例。觸發 `onWindowCreated` 鉤子並設定 `onWindowClosed` 鉤子。

```ts
const createWindow: (name: string) => BrowserWindow
```

**拋出：** 如果視窗名稱未註冊則拋出錯誤。

**回傳值：** 建立的 `BrowserWindow` 實例。

**範例：**

```ts
import { createWindow } from "@x-industry/elevolution-core";

const win = createWindow("main");
win.show();
```

### getWindow

按名稱取得已存在的視窗實例。

```ts
const getWindow: (name: string) => BrowserWindow | undefined
```

### hasWindow

檢查視窗實例是否存在。

```ts
const hasWindow: (name: string) => boolean
```

### getRegisteredWindows

取得所有已註冊的視窗名稱（不僅是活躍實例）。

```ts
const getRegisteredWindows: () => string[]
```

### getAllWindows

取得所有活躍視窗實例，回傳 Map。

```ts
const getAllWindows: () => Map<string, BrowserWindow>
```

### sendToWindow

向指定視窗的渲染程序傳送訊息。

```ts
const sendToWindow: (name: string, channel: string, ...args: any[]) => void
```

**範例：**

```ts
import { sendToWindow } from "@x-industry/elevolution-core";

sendToWindow("main", "user:updated", { id: "123", name: "Alice" });
```

### broadcastToWindows

向所有活躍視窗傳送訊息。

```ts
const broadcastToWindows: (channel: string, ...args: any[]) => void
```

**範例：**

```ts
import { broadcastToWindows } from "@x-industry/elevolution-core";

broadcastToWindows("theme:changed", "dark");
broadcastToWindows("app:notification", { title: "Update", body: "New version available" });
```

### onWindowCreated

註冊一個在任何視窗建立後執行的鉤子。

```ts
const onWindowCreated: (hook: WindowHook) => void
```

**型別：**
```ts
type WindowHook = (name: string, win: BrowserWindow) => void;
```

**範例：**

```ts
import { onWindowCreated } from "@x-industry/elevolution-core";

// 開發環境下注入 DevTools
onWindowCreated((name, win) => {
  if (IS_DEV) {
    win.webContents.openDevTools({ mode: "detach" });
  }
});

// 追蹤視窗建立
onWindowCreated((name, win) => {
  analytics.track("window:created", { name });
});
```

### onWindowClosed

註冊一個在任何視窗關閉時執行的鉤子。

```ts
const onWindowClosed: (hook: WindowHook) => void
```

**範例：**

```ts
import { onWindowClosed } from "@x-industry/elevolution-core";

onWindowClosed((name, win) => {
  console.log(`Window "${name}" was closed`);
  if (name === "main") {
    app.quit();
  }
});
```

---

## 插件模組

匯入方式：`import { ... } from "@x-industry/elevolution-core"` 或 `import { ... } from "@x-industry/elevolution-core/plugin"`

### definePlugin

定義一個插件。這是一個型別恆等函數，為插件定義提供型別檢查。

```ts
const definePlugin: (def: PluginDef) => PluginDef
```

**型別：**
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

**範例：**

```ts
import { definePlugin } from "@x-industry/elevolution-core";

export const myPlugin = definePlugin({
  meta: {
    name: "my-plugin",
    version: "1.0.0",
    description: "Does something useful",
    dependencies: ["other-plugin"], // 可選
  },
  setup(ctx) {
    ctx.log.info("Plugin activated");

    // 回傳清理函數（可選）
    return () => {
      ctx.log.info("Plugin deactivated");
    };
  },
  // 向其他插件暴露 API（可選）
  api: {
    doSomething: () => "result",
  },
});
```

### installPlugin

安裝並啟用一個插件。解析依賴、建立上下文、執行 setup。

```ts
const installPlugin: (def: PluginDef) => Promise<void>
```

**行為：**
1. 檢查插件是否已安裝（如已安裝則警告並回傳）
2. 驗證依賴是否處於活躍狀態
3. 建立包含所有能力的 `PluginContext`
4. 套用上下文擴展器
5. 執行 `setup()` 函數
6. 如有回傳則儲存清理函數
7. 註冊暴露的 API
8. 觸發 `"plugin:activated"` 事件

**拋出：** 如果依賴未處於活躍狀態則拋出錯誤。

### uninstallPlugin

卸載一個插件。執行清理函數，移除 IPC 路由、視窗和命令。

```ts
const uninstallPlugin: (name: string) => Promise<void>
```

### extendPluginContext

向所有插件上下文注入自訂欄位。擴展器會套用到呼叫之後安裝的所有插件。

```ts
const extendPluginContext: (extender: ContextExtender) => void
```

**型別：**
```ts
type ContextExtender = (ctx: PluginContext, meta: PluginMeta) => void;
```

### getPluginState

取得插件的目前狀態。

```ts
const getPluginState: (name: string) => PluginState | undefined
```

**型別：**
```ts
type PluginState = "active" | "inactive" | "error";
```

### getInstalledPlugins

取得所有已安裝插件及其狀態的清單。

```ts
const getInstalledPlugins: () => { name: string; version: string; state: PluginState }[]
```

### executeCommand

透過 ID 執行已註冊的插件命令。

```ts
const executeCommand: (id: string) => void
```

---

## EventBus

匯入方式：`import { EventBus } from "@x-industry/elevolution-core"` 或 `import { EventBus } from "@x-industry/elevolution-core/event-bus"`

全域事件匯流排，用於插件間通訊、命令觸發和生命週期事件。

### EventBus.on

訂閱一個事件。

```ts
EventBus.on(event: string, handler: (...args: any[]) => void): void
```

### EventBus.off

取消訂閱一個事件。如果未提供 handler，則移除該事件的所有處理器。

```ts
EventBus.off(event: string, handler?: (...args: any[]) => void): void
```

### EventBus.emit

觸發一個事件，可附帶參數。

```ts
EventBus.emit(event: string, ...args: any[]): void
```

### EventBus.once

訂閱一個事件，但只觸發一次。

```ts
EventBus.once(event: string, handler: (...args: any[]) => void): void
```

### EventBus.clear

移除所有事件監聽器。

```ts
EventBus.clear(): void
```

### EventBus.onError

設定自訂錯誤處理器，用於處理事件處理器中拋出的錯誤。預設為 `console.error`。

```ts
EventBus.onError(handler: (event: string, error: unknown) => void): void
```

### 內建事件

框架自動觸發以下事件：

| 事件 | 載荷 | 描述 |
|---|---|---|
| `plugin:activated` | `name: string` | 插件成功安裝後觸發 |
| `plugin:deactivated` | `name: string` | 插件卸載後觸發 |
| `command:<id>` | 無 | 呼叫 `executeCommand(id)` 時觸發 |

---

## 日誌器

匯入方式：`import { logger, setLogger } from "@x-industry/elevolution-core"` 或 `import { ... } from "@x-industry/elevolution-core/logger"`

### logger（實例）

目前日誌器實例。使用 Proxy 實作，因此透過 `setLogger` 替換日誌器會立即生效。

```ts
const logger: Logger
```

**預設行為：** 以 `[elevolution]` 前綴輸出到主控台。

### setLogger

替換日誌器實作。所有框架和插件日誌都將使用新的日誌器。

```ts
const setLogger: (newLogger: Logger) => void
```

---

## 熱重載

匯入方式：`import { installPluginHot, stopAllHotReload } from "@x-industry/elevolution-core"` 或 `import { ... } from "@x-industry/elevolution-core/hot-reload"`

### installPluginHot

安裝插件並啟用檔案監聽，用於開發環境下的熱重載。

```ts
const installPluginHot: (
  pluginDir: string,
  def: PluginDef,
  reloadFn: () => PluginDef,
  enabled?: boolean
) => Promise<void>
```

**參數：**
- `pluginDir` — 要監聽的插件目錄路徑
- `def` — 初始安裝的插件定義
- `reloadFn` — 回傳新 `PluginDef` 的函數（檔案變更時呼叫）
- `enabled` — 是否啟用監聽（預設：`true`）。可傳入 `IS_DEV` 或類似值。

### stopAllHotReload

停止所有活躍的檔案監聽器。

```ts
const stopAllHotReload: () => void
```

---

## 型別定義

所有匯出型別的參考：

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

// 視窗
export type WindowFactory = () => BrowserWindow;
export type WindowHook = (name: string, win: BrowserWindow) => void;

// 插件
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

## 子路徑匯出

該套件透過子路徑匯出支援細粒度匯入：

```ts
import { ... } from "@x-industry/elevolution-core";          // 全部
import { ... } from "@x-industry/elevolution-core/ipc";      // 僅 IPC
import { ... } from "@x-industry/elevolution-core/window";   // 僅視窗
import { ... } from "@x-industry/elevolution-core/plugin";   // 僅插件
import { EventBus } from "@x-industry/elevolution-core/event-bus";
import { logger, setLogger } from "@x-industry/elevolution-core/logger";
```