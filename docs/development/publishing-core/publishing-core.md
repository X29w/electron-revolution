# @x-elevolution/core — API Reference

Complete API documentation for the `@x-elevolution/core` package.

**Version:** 0.2.0  
**License:** MIT  
**Install:** `pnpm add @x-elevolution/core`

---

## Table of Contents

- [IPC Module](#ipc-module)
  - [defineHandlers](#definehandlers)
  - [defineListeners](#definelisteners)
  - [defineSenders](#definesenders)
  - [registerRoutes](#registerroutes)
  - [unregisterRoutes](#unregisterroutes)
  - [useIpcMiddleware](#useipcmiddleware)
  - [addIpcInterceptor](#addipcinterceptor)
- [Window Module](#window-module)
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
- [Plugin Module](#plugin-module)
  - [definePlugin](#defineplugin)
  - [installPlugin](#installplugin)
  - [uninstallPlugin](#uninstallplugin)
  - [extendPluginContext](#extendplugincontext)
  - [getPluginState](#getpluginstate)
  - [getInstalledPlugins](#getinstalledplugins)
  - [executeCommand](#executecommand)
- [EventBus](#eventbus)
- [Logger](#logger)
  - [logger instance](#logger-instance)
  - [setLogger](#setlogger)
- [Hot Reload](#hot-reload)
  - [installPluginHot](#installpluginhot)
  - [stopAllHotReload](#stopallhotreload)
- [Type Definitions](#type-definitions)

---

## IPC Module

Import: `import { ... } from "@x-elevolution/core"` or `import { ... } from "@x-elevolution/core/ipc"`

### defineHandlers

Define a set of IPC handlers (request-response pattern via `ipcMain.handle`).

```ts
const defineHandlers: <T extends Record<string, HandleFn>>(handlers: T) => {
  handlers: T;
  routes: IpcRoute[];
}
```

**Parameters:**
- `handlers` — An object mapping channel names to handler functions. Each handler receives `(event: IpcMainInvokeEvent, ...args)` and returns a value.

**Returns:** An object containing `handlers` (the original mapping) and `routes` (an `IpcRoute` array for registration).

**Example:**

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

Define a set of IPC listeners (fire-and-forget pattern via `ipcMain.on`).

```ts
const defineListeners: <T extends Record<string, OnFn>>(listeners: T) => {
  listeners: T;
  routes: IpcRoute[];
}
```

**Parameters:**
- `listeners` — An object mapping channel names to listener functions. Each listener receives `(event: IpcMainEvent, ...args)` and returns nothing.

**Returns:** An object containing `listeners` (the original mapping) and `routes` (an `IpcRoute` array for registration).

**Example:**

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

Define sender functions (main process → renderer communication). This is a type-only helper for documentation and type extraction.

```ts
const defineSenders: <T extends Record<string, (...args: any[]) => void>>(senders: T) => T
```

**Example:**

```ts
import { defineSenders } from "@x-elevolution/core";

export const appSenders = defineSenders({
  "app:notification": (title: string, body: string) => {},
  "app:theme-changed": (theme: "light" | "dark") => {},
});
```

### registerRoutes

Register IPC routes with Electron's `ipcMain`. Applies middleware and interceptors to all registered routes.

```ts
const registerRoutes: (routes: IpcRoute[]) => void
```

**Parameters:**
- `routes` — An array of `IpcRoute` objects (from `defineHandlers` or `defineListeners`).

**Example:**

```ts
import { registerRoutes } from "@x-elevolution/core";
import { fileHandlers } from "./ipc/file";
import { appListeners } from "./ipc/app";

registerRoutes(fileHandlers.routes);
registerRoutes(appListeners.routes);
```

### unregisterRoutes

Remove previously registered IPC routes.

```ts
const unregisterRoutes: (routes: IpcRoute[]) => void
```

**Parameters:**
- `routes` — An array of `IpcRoute` objects to unregister.

**Example:**

```ts
import { unregisterRoutes } from "@x-elevolution/core";
import { fileHandlers } from "./ipc/file";

// Remove all file handlers
unregisterRoutes(fileHandlers.routes);
```

### useIpcMiddleware

Add IPC middleware that can intercept, modify, or abort IPC calls. Middleware executes in the order added.

```ts
const useIpcMiddleware: (middleware: IpcMiddleware) => void
```

**Type:**
```ts
type IpcMiddleware = (
  channel: string,
  type: "handle" | "on",
  args: any[],
  next: () => any
) => any;
```

**Parameters:**
- `middleware` — A function receiving channel name, type, args, and a `next` function. Call `next()` to continue the chain, or return early to abort.

**Example:**

```ts
import { useIpcMiddleware } from "@x-elevolution/core";

// Logging middleware
useIpcMiddleware((channel, type, args, next) => {
  console.log(`[IPC] ${type} ${channel}`, args);
  return next();
});

// Auth middleware — block unauthorized calls
useIpcMiddleware((channel, type, args, next) => {
  if (channel.startsWith("admin:") && !isAdmin()) {
    throw new Error("Unauthorized");
  }
  return next();
});

// Timing middleware
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

Add a lightweight IPC observer. Interceptors cannot modify calls — they can only observe. Returns a function to remove the interceptor.

```ts
const addIpcInterceptor: (interceptor: IpcInterceptor) => () => void
```

**Type:**
```ts
type IpcInterceptor = (channel: string, type: "handle" | "on") => void;
```

**Returns:** A function that removes the interceptor when called.

**Example:**

```ts
import { addIpcInterceptor } from "@x-elevolution/core";

// Track IPC call frequency
const callCounts = new Map<string, number>();

const remove = addIpcInterceptor((channel, type) => {
  callCounts.set(channel, (callCounts.get(channel) ?? 0) + 1);
});

// Later: stop observing
remove();
```

---

## Window Module

Import: `import { ... } from "@x-elevolution/core"` or `import { ... } from "@x-elevolution/core/window"`

### registerWindow

Register a single window factory by name.

```ts
const registerWindow: (name: string, factory: WindowFactory) => void
```

**Type:**
```ts
type WindowFactory = () => BrowserWindow;
```

**Throws:** Error if a window with the same name is already registered.

**Example:**

```ts
import { registerWindow } from "@x-elevolution/core";

registerWindow("settings", () => {
  return new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: { preload: PRELOAD_PATH },
  });
});
```

### registerWindows

Register multiple window factories at once.

```ts
const registerWindows: (windows: Record<string, WindowFactory>) => void
```

**Example:**

```ts
import { registerWindows } from "@x-elevolution/core";

registerWindows({
  main: createMainWindow,
  settings: createSettingsWindow,
  about: createAboutWindow,
});
```

### unregisterWindow

Unregister a window. If the window instance exists and is not destroyed, it will be closed.

```ts
const unregisterWindow: (name: string) => void
```

### createWindow

Create a window instance from a registered factory. Triggers `onWindowCreated` hooks and sets up `onWindowClosed` hooks.

```ts
const createWindow: (name: string) => BrowserWindow
```

**Throws:** Error if the window name is not registered.

**Returns:** The created `BrowserWindow` instance.

**Example:**

```ts
import { createWindow } from "@x-elevolution/core";

const win = createWindow("main");
win.show();
```

### getWindow

Get an existing window instance by name.

```ts
const getWindow: (name: string) => BrowserWindow | undefined
```

### hasWindow

Check if a window instance exists.

```ts
const hasWindow: (name: string) => boolean
```

### getRegisteredWindows

Get all registered window names (not just active instances).

```ts
const getRegisteredWindows: () => string[]
```

### getAllWindows

Get all active window instances as a Map.

```ts
const getAllWindows: () => Map<string, BrowserWindow>
```

### sendToWindow

Send a message to a specific window's renderer process.

```ts
const sendToWindow: (name: string, channel: string, ...args: any[]) => void
```

**Example:**

```ts
import { sendToWindow } from "@x-elevolution/core";

sendToWindow("main", "user:updated", { id: "123", name: "Alice" });
```

### broadcastToWindows

Send a message to all active windows.

```ts
const broadcastToWindows: (channel: string, ...args: any[]) => void
```

**Example:**

```ts
import { broadcastToWindows } from "@x-elevolution/core";

broadcastToWindows("theme:changed", "dark");
broadcastToWindows("app:notification", { title: "Update", body: "New version available" });
```

### onWindowCreated

Register a hook that runs after any window is created.

```ts
const onWindowCreated: (hook: WindowHook) => void
```

**Type:**
```ts
type WindowHook = (name: string, win: BrowserWindow) => void;
```

**Example:**

```ts
import { onWindowCreated } from "@x-elevolution/core";

// Inject DevTools in development
onWindowCreated((name, win) => {
  if (IS_DEV) {
    win.webContents.openDevTools({ mode: "detach" });
  }
});

// Track window creation
onWindowCreated((name, win) => {
  analytics.track("window:created", { name });
});
```

### onWindowClosed

Register a hook that runs when any window is closed.

```ts
const onWindowClosed: (hook: WindowHook) => void
```

**Example:**

```ts
import { onWindowClosed } from "@x-elevolution/core";

onWindowClosed((name, win) => {
  console.log(`Window "${name}" was closed`);
  if (name === "main") {
    app.quit();
  }
});
```

---

## Plugin Module

Import: `import { ... } from "@x-elevolution/core"` or `import { ... } from "@x-elevolution/core/plugin"`

### definePlugin

Define a plugin. This is a type identity function that provides type checking for plugin definitions.

```ts
const definePlugin: (def: PluginDef) => PluginDef
```

**Type:**
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

**Example:**

```ts
import { definePlugin } from "@x-elevolution/core";

export const myPlugin = definePlugin({
  meta: {
    name: "my-plugin",
    version: "1.0.0",
    description: "Does something useful",
    dependencies: ["other-plugin"], // optional
  },
  setup(ctx) {
    ctx.log.info("Plugin activated");

    // Return cleanup function (optional)
    return () => {
      ctx.log.info("Plugin deactivated");
    };
  },
  // Expose API to other plugins (optional)
  api: {
    doSomething: () => "result",
  },
});
```

### installPlugin

Install and activate a plugin. Resolves dependencies, creates context, runs setup.

```ts
const installPlugin: (def: PluginDef) => Promise<void>
```

**Behavior:**
1. Check if plugin is already installed (warn and return if so)
2. Validate dependencies are in active state
3. Create `PluginContext` with all capabilities
4. Apply context extenders
5. Run `setup()` function
6. Store cleanup function if returned
7. Register exposed API
8. Emit `"plugin:activated"` event

**Throws:** Error if dependencies are not in active state.

**Example:**

```ts
import { installPlugin } from "@x-elevolution/core";
import { myPlugin } from "./plugins/my-plugin";

await installPlugin(myPlugin);
```

### PluginContext

The context object passed to each plugin's `setup` function:

```ts
interface PluginContext {
  /** Register IPC routes */
  ipc(routes: IpcRoute[]): void;

  /** Register a window factory */
  window(name: string, factory: WindowFactory): void;

  /** Register a command (triggered via executeCommand or EventBus) */
  command(id: string, handler: () => void | Promise<void>): void;

  /** Subscribe to EventBus events */
  on(event: string, handler: (...args: any[]) => void): void;

  /** Emit EventBus events */
  emit(event: string, ...args: any[]): void;

  /** Access APIs exposed by other plugins */
  use<T = any>(pluginName: string): T | undefined;

  /** Scoped logger (prefixed with plugin name) */
  log: {
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };

  /** Extension fields (via extendPluginContext) */
  [key: string]: any;
}
```

### uninstallPlugin

Uninstall a plugin. Runs cleanup function, removes IPC routes, windows, and commands.

```ts
const uninstallPlugin: (name: string) => Promise<void>
```

**Behavior:**
1. Call cleanup function (if provided during setup)
2. Unregister all IPC routes added by the plugin
3. Unregister all windows added by the plugin
4. Remove all commands
5. Remove exposed API
6. Emit `"plugin:deactivated"` event

**Example:**

```ts
import { uninstallPlugin } from "@x-elevolution/core";

await uninstallPlugin("my-plugin");
```

### extendPluginContext

Inject custom fields into all plugin contexts. Extenders are applied to all plugins installed after the call.

```ts
const extendPluginContext: (extender: ContextExtender) => void
```

**Type:**
```ts
type ContextExtender = (ctx: PluginContext, meta: PluginMeta) => void;
```

**Example:**

```ts
import { extendPluginContext } from "@x-elevolution/core";
import Store from "electron-store";
import { dialog, shell } from "electron";

const store = new Store();

// Call before installing plugins
extendPluginContext((ctx, meta) => {
  ctx.store = store;
  ctx.dialog = dialog;
  ctx.shell = shell;
  ctx.dataDir = path.join(app.getPath("userData"), "plugins", meta.name);
});
```

### getPluginState

Get the current state of a plugin.

```ts
const getPluginState: (name: string) => PluginState | undefined
```

**Type:**
```ts
type PluginState = "active" | "inactive" | "error";
```

### getInstalledPlugins

Get a list of all installed plugins with their states.

```ts
const getInstalledPlugins: () => { name: string; version: string; state: PluginState }[]
```

**Example:**

```ts
import { getInstalledPlugins } from "@x-elevolution/core";

const plugins = getInstalledPlugins();
// [{ name: "devtools", version: "1.0.0", state: "active" }, ...]
```

### executeCommand

Execute a registered plugin command by ID.

```ts
const executeCommand: (id: string) => void
```

**Example:**

```ts
import { executeCommand } from "@x-elevolution/core";

executeCommand("notes:clear-all");
executeCommand("devtools:toggle");
```

---

## EventBus

Import: `import { EventBus } from "@x-elevolution/core"` or `import { EventBus } from "@x-elevolution/core/event-bus"`

A global event bus for inter-plugin communication, command triggering, and lifecycle events.

### EventBus.on

Subscribe to an event.

```ts
EventBus.on(event: string, handler: (...args: any[]) => void): void
```

### EventBus.off

Unsubscribe from an event. If no handler is provided, removes all handlers for that event.

```ts
EventBus.off(event: string, handler?: (...args: any[]) => void): void
```

### EventBus.emit

Emit an event with optional arguments.

```ts
EventBus.emit(event: string, ...args: any[]): void
```

### EventBus.once

Subscribe to an event, but only trigger once.

```ts
EventBus.once(event: string, handler: (...args: any[]) => void): void
```

### EventBus.clear

Remove all event listeners.

```ts
EventBus.clear(): void
```

### EventBus.onError

Set a custom error handler for errors thrown in event handlers. Defaults to `console.error`.

```ts
EventBus.onError(handler: (event: string, error: unknown) => void): void
```

**Example:**

```ts
import { EventBus } from "@x-elevolution/core";

// Custom error handling
EventBus.onError((event, error) => {
  logger.error(`EventBus error in "${event}":`, error);
  Sentry.captureException(error);
});
```

### Built-in Events

The framework automatically emits the following events:

| Event | Payload | Description |
|---|---|---|
| `plugin:activated` | `name: string` | Emitted after a plugin is successfully installed |
| `plugin:deactivated` | `name: string` | Emitted after a plugin is uninstalled |
| `command:<id>` | none | Emitted when `executeCommand(id)` is called |

---

## Logger

Import: `import { logger, setLogger } from "@x-elevolution/core"` or `import { ... } from "@x-elevolution/core/logger"`

### logger (instance)

The current logger instance. Implemented with a Proxy, so replacing the logger via `setLogger` takes effect immediately.

```ts
const logger: Logger
```

**Type:**
```ts
interface Logger {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  [key: string]: any;  // Supports additional methods from custom loggers
}
```

**Default behavior:** Outputs to console with `[x-elevolution]` prefix.

### setLogger

Replace the logger implementation. All framework and plugin logs will use the new logger.

```ts
const setLogger: (newLogger: Logger) => void
```

**Example:**

```ts
import { setLogger } from "@x-elevolution/core";
import log from "electron-log";

// Use electron-log
setLogger(log);

// Use pino
import pino from "pino";
setLogger(pino());

// Use winston
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

## Hot Reload

Import: `import { installPluginHot, stopAllHotReload } from "@x-elevolution/core"` or `import { ... } from "@x-elevolution/core/hot-reload"`

### installPluginHot

Install a plugin with file watching enabled for hot-reload in development.

```ts
const installPluginHot: (
  pluginDir: string,
  def: PluginDef,
  reloadFn: () => PluginDef,
  enabled?: boolean
) => Promise<void>
```

**Parameters:**
- `pluginDir` — Path to the plugin directory to watch
- `def` — The plugin definition to install initially
- `reloadFn` — A function that returns a new `PluginDef` (called on file changes)
- `enabled` — Whether to enable watching (default: `true`). Pass `IS_DEV` or similar.

**Behavior:**
1. Install the plugin normally via `installPlugin`
2. If `enabled`, start a recursive file watcher on `pluginDir`
3. When a `.ts` file changes: uninstall plugin, call `reloadFn()`, reinstall

**Example:**

```ts
import { installPluginHot } from "@x-elevolution/core";
import { devtoolsPlugin } from "./plugins/devtools";

await installPluginHot(
  "./main-process/plugins/devtools",
  devtoolsPlugin,
  () => {
    // Clear module cache and re-import
    delete require.cache[require.resolve("./plugins/devtools")];
    return require("./plugins/devtools").devtoolsPlugin;
  },
  IS_DEV
);
```

### stopAllHotReload

Stop all active file watchers.

```ts
const stopAllHotReload: () => void
```

**Example:**

```ts
import { stopAllHotReload } from "@x-elevolution/core";

app.on("before-quit", () => {
  stopAllHotReload();
});
```

---

## Type Definitions

Reference for all exported types:

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

// Window
export type WindowFactory = () => BrowserWindow;
export type WindowHook = (name: string, win: BrowserWindow) => void;

// Plugin
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

// Logger
export interface Logger {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  [key: string]: any;
}
```

---

## Subpath Exports

The package supports fine-grained imports via subpath exports:

```ts
import { ... } from "@x-elevolution/core";          // Everything
import { ... } from "@x-elevolution/core/ipc";      // IPC only
import { ... } from "@x-elevolution/core/window";   // Window only
import { ... } from "@x-elevolution/core/plugin";   // Plugin only
import { EventBus } from "@x-elevolution/core/event-bus";
import { logger, setLogger } from "@x-elevolution/core/logger";
```
