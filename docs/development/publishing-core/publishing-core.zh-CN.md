# @x-industry/elevolution-core — API 参考文档

`@x-industry/elevolution-core` 包的完整 API 文档。

**版本：** 0.2.0  
**许可证：** MIT  
**安装：** `pnpm add @x-industry/elevolution-core`

---

## 目录

- [IPC 模块](#ipc-模块)
  - [defineHandlers](#definehandlers)
  - [defineListeners](#definelisteners)
  - [defineSenders](#definesenders)
  - [registerRoutes](#registerroutes)
  - [unregisterRoutes](#unregisterroutes)
  - [useIpcMiddleware](#useipcmiddleware)
  - [addIpcInterceptor](#addipcinterceptor)
- [窗口模块](#窗口模块)
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
- [插件模块](#插件模块)
  - [definePlugin](#defineplugin)
  - [installPlugin](#installplugin)
  - [uninstallPlugin](#uninstallplugin)
  - [extendPluginContext](#extendplugincontext)
  - [getPluginState](#getpluginstate)
  - [getInstalledPlugins](#getinstalledplugins)
  - [executeCommand](#executecommand)
- [EventBus](#eventbus)
- [日志器](#日志器)
  - [logger](#logger-实例)
  - [setLogger](#setlogger)
- [热重载](#热重载)
  - [installPluginHot](#installpluginhot)
  - [stopAllHotReload](#stopallhotreload)
- [类型定义](#类型定义)

---

## IPC 模块

导入方式：`import { ... } from "@x-industry/elevolution-core"` 或 `import { ... } from "@x-industry/elevolution-core/ipc"`

### defineHandlers

定义一组 IPC 处理器（通过 `ipcMain.handle` 实现请求-响应模式）。

```ts
const defineHandlers: <T extends Record<string, HandleFn>>(handlers: T) => {
  handlers: T;
  routes: IpcRoute[];
}
```

**参数：**
- `handlers` — 将通道名称映射到处理函数的对象。每个处理器接收 `(event: IpcMainInvokeEvent, ...args)` 并返回一个值。

**返回值：** 包含 `handlers`（原始映射）和 `routes`（用于注册的 `IpcRoute` 数组）的对象。

**示例：**

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

定义一组 IPC 监听器（通过 `ipcMain.on` 实现即发即忘模式）。

```ts
const defineListeners: <T extends Record<string, OnFn>>(listeners: T) => {
  listeners: T;
  routes: IpcRoute[];
}
```

**参数：**
- `listeners` — 将通道名称映射到监听函数的对象。每个监听器接收 `(event: IpcMainEvent, ...args)` 且无返回值。

**返回值：** 包含 `listeners`（原始映射）和 `routes`（用于注册的 `IpcRoute` 数组）的对象。

**示例：**

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

定义发送函数（主进程 → 渲染进程通信）。这是一个仅用于文档和类型提取的类型辅助函数。

```ts
const defineSenders: <T extends Record<string, (...args: any[]) => void>>(senders: T) => T
```

**示例：**

```ts
import { defineSenders } from "@x-industry/elevolution-core";

export const appSenders = defineSenders({
  "app:notification": (title: string, body: string) => {},
  "app:theme-changed": (theme: "light" | "dark") => {},
});
```

### registerRoutes

将 IPC 路由注册到 Electron 的 `ipcMain`。对所有注册的路由应用中间件和拦截器。

```ts
const registerRoutes: (routes: IpcRoute[]) => void
```

**参数：**
- `routes` — `IpcRoute` 对象数组（来自 `defineHandlers` 或 `defineListeners`）。

**示例：**

```ts
import { registerRoutes } from "@x-industry/elevolution-core";
import { fileHandlers } from "./ipc/file";
import { appListeners } from "./ipc/app";

registerRoutes(fileHandlers.routes);
registerRoutes(appListeners.routes);
```

### unregisterRoutes

移除之前注册的 IPC 路由。

```ts
const unregisterRoutes: (routes: IpcRoute[]) => void
```

**参数：**
- `routes` — 要注销的 `IpcRoute` 对象数组。

**示例：**

```ts
import { unregisterRoutes } from "@x-industry/elevolution-core";
import { fileHandlers } from "./ipc/file";

// 移除所有文件处理器
unregisterRoutes(fileHandlers.routes);
```

### useIpcMiddleware

添加 IPC 中间件，可以拦截、修改或中止 IPC 调用。中间件按添加顺序执行。

```ts
const useIpcMiddleware: (middleware: IpcMiddleware) => void
```

**类型：**
```ts
type IpcMiddleware = (
  channel: string,
  type: "handle" | "on",
  args: any[],
  next: () => any
) => any;
```

**参数：**
- `middleware` — 接收通道名称、类型、参数和 `next` 函数的函数。调用 `next()` 继续链式调用，或提前返回以中止。

**示例：**

```ts
import { useIpcMiddleware } from "@x-industry/elevolution-core";

// 日志中间件
useIpcMiddleware((channel, type, args, next) => {
  console.log(`[IPC] ${type} ${channel}`, args);
  return next();
});

// 鉴权中间件——阻止未授权调用
useIpcMiddleware((channel, type, args, next) => {
  if (channel.startsWith("admin:") && !isAdmin()) {
    throw new Error("Unauthorized");
  }
  return next();
});

// 计时中间件
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

添加轻量级 IPC 观察器。拦截器不能修改调用——只能观察。返回一个用于移除拦截器的函数。

```ts
const addIpcInterceptor: (interceptor: IpcInterceptor) => () => void
```

**类型：**
```ts
type IpcInterceptor = (channel: string, type: "handle" | "on") => void;
```

**返回值：** 调用时移除拦截器的函数。

**示例：**

```ts
import { addIpcInterceptor } from "@x-industry/elevolution-core";

// 追踪 IPC 调用频率
const callCounts = new Map<string, number>();

const remove = addIpcInterceptor((channel, type) => {
  callCounts.set(channel, (callCounts.get(channel) ?? 0) + 1);
});

// 之后：停止观察
remove();
```

---

## 窗口模块

导入方式：`import { ... } from "@x-industry/elevolution-core"` 或 `import { ... } from "@x-industry/elevolution-core/window"`

### registerWindow

按名称注册单个窗口工厂。

```ts
const registerWindow: (name: string, factory: WindowFactory) => void
```

**类型：**
```ts
type WindowFactory = () => BrowserWindow;
```

**抛出：** 如果同名窗口已注册则抛出错误。

**示例：**

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

一次注册多个窗口工厂。

```ts
const registerWindows: (windows: Record<string, WindowFactory>) => void
```

**示例：**

```ts
import { registerWindows } from "@x-industry/elevolution-core";

registerWindows({
  main: createMainWindow,
  settings: createSettingsWindow,
  about: createAboutWindow,
});
```

### unregisterWindow

注销一个窗口。如果窗口实例存在且未被销毁，将会被关闭。

```ts
const unregisterWindow: (name: string) => void
```

### createWindow

从已注册的工厂创建窗口实例。触发 `onWindowCreated` 钩子并设置 `onWindowClosed` 钩子。

```ts
const createWindow: (name: string) => BrowserWindow
```

**抛出：** 如果窗口名称未注册则抛出错误。

**返回值：** 创建的 `BrowserWindow` 实例。

**示例：**

```ts
import { createWindow } from "@x-industry/elevolution-core";

const win = createWindow("main");
win.show();
```

### getWindow

按名称获取已存在的窗口实例。

```ts
const getWindow: (name: string) => BrowserWindow | undefined
```

### hasWindow

检查窗口实例是否存在。

```ts
const hasWindow: (name: string) => boolean
```

### getRegisteredWindows

获取所有已注册的窗口名称（不仅是活跃实例）。

```ts
const getRegisteredWindows: () => string[]
```

### getAllWindows

获取所有活跃窗口实例，返回 Map。

```ts
const getAllWindows: () => Map<string, BrowserWindow>
```

### sendToWindow

向指定窗口的渲染进程发送消息。

```ts
const sendToWindow: (name: string, channel: string, ...args: any[]) => void
```

**示例：**

```ts
import { sendToWindow } from "@x-industry/elevolution-core";

sendToWindow("main", "user:updated", { id: "123", name: "Alice" });
```

### broadcastToWindows

向所有活跃窗口发送消息。

```ts
const broadcastToWindows: (channel: string, ...args: any[]) => void
```

**示例：**

```ts
import { broadcastToWindows } from "@x-industry/elevolution-core";

broadcastToWindows("theme:changed", "dark");
broadcastToWindows("app:notification", { title: "Update", body: "New version available" });
```

### onWindowCreated

注册一个在任何窗口创建后运行的钩子。

```ts
const onWindowCreated: (hook: WindowHook) => void
```

**类型：**
```ts
type WindowHook = (name: string, win: BrowserWindow) => void;
```

**示例：**

```ts
import { onWindowCreated } from "@x-industry/elevolution-core";

// 开发环境下注入 DevTools
onWindowCreated((name, win) => {
  if (IS_DEV) {
    win.webContents.openDevTools({ mode: "detach" });
  }
});

// 追踪窗口创建
onWindowCreated((name, win) => {
  analytics.track("window:created", { name });
});
```

### onWindowClosed

注册一个在任何窗口关闭时运行的钩子。

```ts
const onWindowClosed: (hook: WindowHook) => void
```

**示例：**

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

## 插件模块

导入方式：`import { ... } from "@x-industry/elevolution-core"` 或 `import { ... } from "@x-industry/elevolution-core/plugin"`

### definePlugin

定义一个插件。这是一个类型恒等函数，为插件定义提供类型检查。

```ts
const definePlugin: (def: PluginDef) => PluginDef
```

**类型：**
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

**示例：**

```ts
import { definePlugin } from "@x-industry/elevolution-core";

export const myPlugin = definePlugin({
  meta: {
    name: "my-plugin",
    version: "1.0.0",
    description: "Does something useful",
    dependencies: ["other-plugin"], // 可选
  },
  setup(ctx) {
    ctx.log.info("Plugin activated");

    // 返回清理函数（可选）
    return () => {
      ctx.log.info("Plugin deactivated");
    };
  },
  // 向其他插件暴露 API（可选）
  api: {
    doSomething: () => "result",
  },
});
```

### installPlugin

安装并激活一个插件。解析依赖、创建上下文、运行 setup。

```ts
const installPlugin: (def: PluginDef) => Promise<void>
```

**行为：**
1. 检查插件是否已安装（如已安装则警告并返回）
2. 验证依赖是否处于活跃状态
3. 创建包含所有能力的 `PluginContext`
4. 应用上下文扩展器
5. 运行 `setup()` 函数
6. 如有返回则存储清理函数
7. 注册暴露的 API
8. 触发 `"plugin:activated"` 事件

**抛出：** 如果依赖未处于活跃状态则抛出错误。

**示例：**

```ts
import { installPlugin } from "@x-industry/elevolution-core";
import { myPlugin } from "./plugins/my-plugin";

await installPlugin(myPlugin);
```

### PluginContext

传递给每个插件 `setup` 函数的上下文对象：

```ts
interface PluginContext {
  /** 注册 IPC 路由 */
  ipc(routes: IpcRoute[]): void;

  /** 注册窗口工厂 */
  window(name: string, factory: WindowFactory): void;

  /** 注册命令（通过 executeCommand 或 EventBus 触发） */
  command(id: string, handler: () => void | Promise<void>): void;

  /** 订阅 EventBus 事件 */
  on(event: string, handler: (...args: any[]) => void): void;

  /** 触发 EventBus 事件 */
  emit(event: string, ...args: any[]): void;

  /** 访问其他插件暴露的 API */
  use<T = any>(pluginName: string): T | undefined;

  /** 作用域日志器（以插件名称为前缀） */
  log: {
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };

  /** 扩展字段（通过 extendPluginContext） */
  [key: string]: any;
}
```

### uninstallPlugin

卸载一个插件。运行清理函数，移除 IPC 路由、窗口和命令。

```ts
const uninstallPlugin: (name: string) => Promise<void>
```

**行为：**
1. 调用清理函数（如果 setup 期间有提供）
2. 注销插件添加的所有 IPC 路由
3. 注销插件添加的所有窗口
4. 移除所有命令
5. 移除暴露的 API
6. 触发 `"plugin:deactivated"` 事件

**示例：**

```ts
import { uninstallPlugin } from "@x-industry/elevolution-core";

await uninstallPlugin("my-plugin");
```

### extendPluginContext

向所有插件上下文注入自定义字段。扩展器会应用到调用之后安装的所有插件。

```ts
const extendPluginContext: (extender: ContextExtender) => void
```

**类型：**
```ts
type ContextExtender = (ctx: PluginContext, meta: PluginMeta) => void;
```

**示例：**

```ts
import { extendPluginContext } from "@x-industry/elevolution-core";
import Store from "electron-store";
import { dialog, shell } from "electron";

const store = new Store();

// 在安装插件之前调用
extendPluginContext((ctx, meta) => {
  ctx.store = store;
  ctx.dialog = dialog;
  ctx.shell = shell;
  ctx.dataDir = path.join(app.getPath("userData"), "plugins", meta.name);
});
```

### getPluginState

获取插件的当前状态。

```ts
const getPluginState: (name: string) => PluginState | undefined
```

**类型：**
```ts
type PluginState = "active" | "inactive" | "error";
```

### getInstalledPlugins

获取所有已安装插件及其状态的列表。

```ts
const getInstalledPlugins: () => { name: string; version: string; state: PluginState }[]
```

**示例：**

```ts
import { getInstalledPlugins } from "@x-industry/elevolution-core";

const plugins = getInstalledPlugins();
// [{ name: "devtools", version: "1.0.0", state: "active" }, ...]
```

### executeCommand

通过 ID 执行已注册的插件命令。

```ts
const executeCommand: (id: string) => void
```

**示例：**

```ts
import { executeCommand } from "@x-industry/elevolution-core";

executeCommand("notes:clear-all");
executeCommand("devtools:toggle");
```

---

## EventBus

导入方式：`import { EventBus } from "@x-industry/elevolution-core"` 或 `import { EventBus } from "@x-industry/elevolution-core/event-bus"`

全局事件总线，用于插件间通信、命令触发和生命周期事件。

### EventBus.on

订阅一个事件。

```ts
EventBus.on(event: string, handler: (...args: any[]) => void): void
```

### EventBus.off

取消订阅一个事件。如果未提供 handler，则移除该事件的所有处理器。

```ts
EventBus.off(event: string, handler?: (...args: any[]) => void): void
```

### EventBus.emit

触发一个事件，可附带参数。

```ts
EventBus.emit(event: string, ...args: any[]): void
```

### EventBus.once

订阅一个事件，但只触发一次。

```ts
EventBus.once(event: string, handler: (...args: any[]) => void): void
```

### EventBus.clear

移除所有事件监听器。

```ts
EventBus.clear(): void
```

### EventBus.onError

设置自定义错误处理器，用于处理事件处理器中抛出的错误。默认为 `console.error`。

```ts
EventBus.onError(handler: (event: string, error: unknown) => void): void
```

**示例：**

```ts
import { EventBus } from "@x-industry/elevolution-core";

// 自定义错误处理
EventBus.onError((event, error) => {
  logger.error(`EventBus error in "${event}":`, error);
  Sentry.captureException(error);
});
```

### 内置事件

框架自动触发以下事件：

| 事件 | 载荷 | 描述 |
|---|---|---|
| `plugin:activated` | `name: string` | 插件成功安装后触发 |
| `plugin:deactivated` | `name: string` | 插件卸载后触发 |
| `command:<id>` | 无 | 调用 `executeCommand(id)` 时触发 |

---

## 日志器

导入方式：`import { logger, setLogger } from "@x-industry/elevolution-core"` 或 `import { ... } from "@x-industry/elevolution-core/logger"`

### logger（实例）

当前日志器实例。使用 Proxy 实现，因此通过 `setLogger` 替换日志器会立即生效。

```ts
const logger: Logger
```

**类型：**
```ts
interface Logger {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  [key: string]: any;  // 支持自定义日志器的额外方法
}
```

**默认行为：** 以 `[elevolution]` 前缀输出到控制台。

### setLogger

替换日志器实现。所有框架和插件日志都将使用新的日志器。

```ts
const setLogger: (newLogger: Logger) => void
```

**示例：**

```ts
import { setLogger } from "@x-industry/elevolution-core";
import log from "electron-log";

// 使用 electron-log
setLogger(log);

// 使用 pino
import pino from "pino";
setLogger(pino());

// 使用 winston
import winston from "winston";
const winstonLogger = winston.createLogger({ /* ... */ });
setLogger({
  info: (...args) => winstonLogger.info(args.join(" ")),
  warn: (...args) => winstonLogger.warn(args.join(" ")),
  error: (...args) => winstonLogger.error(args.join(" ")),
  debug: (...args) => winstonLogger.debug(args.join(" ")),
});
```

---

## 热重载

导入方式：`import { installPluginHot, stopAllHotReload } from "@x-industry/elevolution-core"` 或 `import { ... } from "@x-industry/elevolution-core/hot-reload"`

### installPluginHot

安装插件并启用文件监听，用于开发环境下的热重载。

```ts
const installPluginHot: (
  pluginDir: string,
  def: PluginDef,
  reloadFn: () => PluginDef,
  enabled?: boolean
) => Promise<void>
```

**参数：**
- `pluginDir` — 要监听的插件目录路径
- `def` — 初始安装的插件定义
- `reloadFn` — 返回新 `PluginDef` 的函数（文件变更时调用）
- `enabled` — 是否启用监听（默认：`true`）。可传入 `IS_DEV` 或类似值。

**行为：**
1. 通过 `installPlugin` 正常安装插件
2. 如果 `enabled`，在 `pluginDir` 上启动递归文件监听器
3. 当 `.ts` 文件变更时：卸载插件，调用 `reloadFn()`，重新安装

**示例：**

```ts
import { installPluginHot } from "@x-industry/elevolution-core";
import { devtoolsPlugin } from "./plugins/devtools";

await installPluginHot(
  "./main-process/plugins/devtools",
  devtoolsPlugin,
  () => {
    // 清除模块缓存并重新导入
    delete require.cache[require.resolve("./plugins/devtools")];
    return require("./plugins/devtools").devtoolsPlugin;
  },
  IS_DEV
);
```

### stopAllHotReload

停止所有活跃的文件监听器。

```ts
const stopAllHotReload: () => void
```

**示例：**

```ts
import { stopAllHotReload } from "@x-industry/elevolution-core";

app.on("before-quit", () => {
  stopAllHotReload();
});
```

---

## 类型定义

所有导出类型的参考：

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

export type ExtractArgs<F> = F extends (event: any, ...args: infer A) => any ? A : never;
export type ExtractReturn<F> = F extends (event: any, ...args: any[]) => infer R ? R : never;

// 窗口
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

// 日志器
export interface Logger {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  [key: string]: any;
}
```

---

## 子路径导出

该包通过子路径导出支持细粒度导入：

```ts
import { ... } from "@x-industry/elevolution-core";          // 全部
import { ... } from "@x-industry/elevolution-core/ipc";      // 仅 IPC
import { ... } from "@x-industry/elevolution-core/window";   // 仅窗口
import { ... } from "@x-industry/elevolution-core/plugin";   // 仅插件
import { EventBus } from "@x-industry/elevolution-core/event-bus";
import { logger, setLogger } from "@x-industry/elevolution-core/logger";
```
