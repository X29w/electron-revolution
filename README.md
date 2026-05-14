# ⚡ Revolution

<p align="center">
  <strong>A functional, plugin-based Electron framework with zero-config type-safe IPC.</strong>
</p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README.zh-CN.md">简体中文</a> ·
  <a href="./README.zh-TW.md">繁體中文</a> ·
  <a href="./README.ja.md">日本語</a>
</p>

---

## What is Revolution

Revolution is an Electron application framework that takes a different approach:

- **No classes, no decorators** — pure functions and file-based modules
- **IPC types generated from code** — write a handler, run one command, renderer gets full type safety
- **Plugin system** — encapsulate features as installable/uninstable units
- **CLI scaffolding** — generate windows, plugins, IPC modules with one command

---

## Getting Started

### Create a new project

```bash
npx electron-revolution create my-app
cd my-app
pnpm install
pnpm dev
```

### Or clone this repo

```bash
git clone https://github.com/user/electron-revolution.git
cd electron-revolution
pnpm install
pnpm dev
```

---

## CLI Commands

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Start dev server with hot-reload |
| `pnpm build` | Production build + electron-builder packaging |
| `pnpm gen:ipc` | Generate renderer IPC types from main process handlers |
| `pnpm add:window <name>` | Scaffold a new window (main + renderer files) |
| `pnpm add:plugin <name>` | Scaffold a new plugin |
| `pnpm add:ipc <name>` | Scaffold a new IPC module |

---

## How IPC Works

Revolution has 3 IPC directions, all type-safe:

| Direction | Main process API | Renderer API | Define with |
|-----------|-----------------|--------------|-------------|
| Renderer → Main (with return) | `ipcMain.handle` | `ipcInvoke(channel, ...args)` | `defineHandlers` |
| Renderer → Main (fire & forget) | `ipcMain.on` | `ipcSend(channel, ...args)` | `defineListeners` |
| Main → Renderer | `webContents.send` | `ipcOn(channel, listener)` | `defineSenders` |

### Step 1: Define handlers in main process

```ts
// main-process/ipc/user.ts
import { defineHandlers, defineListeners } from "../core/ipc";

// Renderer calls, main responds with return value
export const userHandlers = defineHandlers({
  "user:get": (_, id: string) => ({ id, name: "Alice" }),
  "user:list": () => [{ id: "1", name: "Alice" }],
});

// Renderer sends, main receives (no return)
export const userListeners = defineListeners({
  "user:delete": (_, id: string) => {
    console.log("deleting user:", id);
  },
});
```

### Step 2: Register

```ts
// main-process/ipc/index.ts
import { registerRoutes } from "../core/ipc";
import { userHandlers, userListeners } from "./user";

export const registerAllIpc = () => {
  registerRoutes(userHandlers.routes);
  registerRoutes(userListeners.routes);
};
```

### Step 3: Generate types

```bash
pnpm gen:ipc
```

This reads your handler code and generates `renderer-process/shared/services/ipc.generated.ts` with full types.

### Step 4: Call from renderer

```ts
import { ipcInvoke, ipcSend } from "@renderer-process/shared/services/ipc";

const user = await ipcInvoke("user:get", "123");
//    ^? { id: string; name: string }  ← auto-inferred

ipcSend("user:delete", "123");
//                      ^? string  ← type-checked
```

### Main → Renderer

```ts
// main-process/ipc/senders.ts
import { defineSenders } from "../core/ipc";

export const senders = defineSenders({
  "store:changed": (_value: StoreOptions) => {},
});

// Usage in main process:
import { sendToWindow } from "./core/window";
sendToWindow("main", "store:changed", newValue);

// Renderer listens:
import { ipcOn } from "@renderer-process/shared/services/ipc";
ipcOn("store:changed", (_, value) => { /* ... */ });
```

---

## How Plugins Work

A plugin is a **self-contained feature module**. It can register IPC routes, windows, and commands — then be installed or uninstalled at runtime.

### When to use a plugin

- You want to add a feature that can be toggled on/off
- You want to share a feature across projects
- You want to isolate a feature's code from the rest of the app

### Defining a plugin

```ts
// main-process/plugins/screenshot/index.ts
import { definePlugin, defineHandlers } from "../../core";

const handlers = defineHandlers({
  "screenshot:capture": () => { /* capture logic */ return "/path/to/file.png"; },
});

export const screenshotPlugin = definePlugin({
  meta: { name: "screenshot", version: "1.0.0" },
  setup(ctx) {
    ctx.ipc(handlers.routes);
    ctx.log.info("screenshot plugin ready");

    // Optional: return cleanup function
    return () => ctx.log.info("screenshot plugin removed");
  },
});
```

### Installing a plugin

```ts
// main-process/main.ts
import { installPlugin } from "./core";
import { screenshotPlugin } from "./plugins/screenshot";

await installPlugin(screenshotPlugin);
```

### Plugin context API

| Method | What it does |
|--------|-------------|
| `ctx.ipc(routes)` | Register IPC routes (available to all windows) |
| `ctx.window(name, factory)` | Register a new window |
| `ctx.command(id, handler)` | Register a named command |
| `ctx.on(event, handler)` | Listen to internal events |
| `ctx.emit(event, ...args)` | Emit internal events |
| `ctx.use<T>(pluginName)` | Access another plugin's exposed API |
| `ctx.log.info/warn/error` | Scoped logging |

### Plugin communication

```ts
// Plugin A exposes API
export const pluginA = definePlugin({
  meta: { name: "plugin-a", version: "1.0.0" },
  api: { getData: () => [1, 2, 3] },
  setup(ctx) { /* ... */ },
});

// Plugin B uses Plugin A's API
export const pluginB = definePlugin({
  meta: { name: "plugin-b", version: "1.0.0", dependencies: ["plugin-a"] },
  setup(ctx) {
    const a = ctx.use<{ getData: () => number[] }>("plugin-a");
    console.log(a?.getData()); // [1, 2, 3]
  },
});
```

---

## Adding a Window

```bash
pnpm add:window settings
```

This generates:

```
main-process/windows/settings.ts          ← window factory function
renderer-process/windows/settings/
├── App.tsx                                ← React component
├── main.tsx                               ← entry point
└── index.html                             ← HTML template
```

Then register it:

```ts
// main-process/windows/index.ts
import { createSettingsWindow } from "./settings";

export const windows = {
  main: createMainWindow,
  settings: createSettingsWindow,  // ← add this
};
```

And add to vite config:

```ts
// vite.config.ts → build.rollupOptions.input
settings: resolve(__dirname, "renderer-process/windows/settings/index.html"),
```

---

## DevTools (Development Only)

In dev mode, a built-in DevTools plugin loads automatically. Open it from the main window's **🛠 DevTools** button.

It shows:
- **Overview** — memory, uptime, counts
- **Plugins** — installed plugins and their state
- **IPC Log** — every IPC call with timestamp, direction (handle/on), and channel name
- **Windows** — all registered windows

All IPC calls (including those from plugins) are recorded.

---

## Project Structure

```
main-process/
├── core/               Framework core (ipc, window, plugin, logger, hot-reload)
├── ipc/                IPC modules (one file per feature)
├── windows/            Window factory functions
├── plugins/            Plugin directory
├── electron-store/     Persistent config
├── constant/           App constants
└── main.ts             Entry point

renderer-process/
├── shared/services/    IPC client (auto-generated types)
└── windows/            Window UIs (React + Tailwind)

cli/                    Code generator
```

---

## Tech Stack

Electron 37 · Vite 6 · React 19 · TypeScript 5.9 · Tailwind CSS 4 · Biome · electron-builder

---

## Local CLI Testing

To test the CLI as if you were a user:

```bash
# Link globally
pnpm link --global

# In any directory
revolution create test-app
cd test-app
pnpm install
pnpm dev

# Unlink when done
pnpm unlink --global
```

Or without global link:

```bash
npx tsx cli/index.ts create test-app
```

---

## License

MIT
