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

### 💡 What is this

Revolution is a **functional, plugin-based** Electron application framework.

Unlike traditional Electron boilerplates, Revolution innovates in these areas:

1. **🔌 Plugin Architecture** — All features exist as plugins with hot-swap, dependency management, and inter-plugin communication
2. **🧠 Zero-config Type-safe IPC** — Write handlers in main process, one command generates full renderer types
3. **🛠 CLI Code Generation** — Windows, plugins, IPC modules generated with a single command
4. **📦 Purely Functional** — No classes, no decorators, modularity through file organization

### 🚀 Innovation

| Feature | Traditional | Revolution |
|---------|-------------|------------|
| IPC Types | Hand-written `.d.ts`, easily out of sync | `pnpm gen:ipc` auto-infers from handlers |
| Extensibility | Modify main process directly, tight coupling | Plugin system with `definePlugin` + `setup` |
| New Window | Manually create 5+ files | `pnpm add:window settings` one command |
| Code Organization | Decorators + class inheritance | Pure functions + file modules |
| Plugin Communication | No standard approach | EventBus + exposed plugin APIs |

### 📁 Project Structure

```
main-process/
├── core/                 # 🧱 Framework core
│   ├── ipc.ts            #    defineHandlers / defineListeners
│   ├── window.ts         #    Window registry & management
│   ├── plugin.ts         #    Plugin lifecycle
│   ├── event-bus.ts      #    Event bus
│   └── logger.ts         #    Logging
├── ipc/                  # 📡 IPC modules (split by feature)
├── windows/              # 🪟 Window factory functions
├── plugins/              # 🔌 Plugin directory
└── main.ts               # 🚪 Entry point

renderer-process/
├── shared/services/
│   └── ipc.generated.ts  # ⚙️ Auto-generated type-safe IPC
└── windows/              # 📄 Window pages

cli/                      # 🛠 CLI tools
```

### 🔧 Quick Start

```bash
pnpm install
pnpm dev
```

### 📋 CLI Commands

```bash
pnpm add:window settings      # 🪟 Add a window
pnpm add:plugin file-manager  # 🔌 Add a plugin
pnpm add:ipc auth             # 📡 Add an IPC module
pnpm gen:ipc                  # ⚙️ Generate renderer IPC types
pnpm cli create my-app        # 📦 Create a new project
```

### 🧩 Core Usage

**Define IPC (main process)**

```ts
import { defineHandlers } from "../core/ipc";

export const userHandlers = defineHandlers({
  "user:get": (_, id: string) => ({ id, name: "test" }),
  "user:list": () => [{ id: "1", name: "test" }],
});
```

**Renderer call (auto-generated types)**

```ts
import { ipcInvoke } from "@renderer-process/shared/services/ipc";

const user = await ipcInvoke("user:get", "123");
// ✅ user is typed as { id: string; name: string }
```

**Define a plugin**

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

### 📖 Development Flow

```
1. Write handler  →  defineHandlers({ "channel": handler })
2. Register       →  registerRoutes() in ipc/index.ts
3. Generate types →  pnpm gen:ipc
4. Call from renderer → ipcInvoke("channel", args) ← full type hints
```

---

## 📄 License

MIT
