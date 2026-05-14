# ⚡ Revolution

<p align="center">
  <strong>函数式、插件化的 Electron 框架，零配置类型安全 IPC。</strong>
</p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README.zh-CN.md">简体中文</a> ·
  <a href="./README.zh-TW.md">繁體中文</a> ·
  <a href="./README.ja.md">日本語</a>
</p>

---

## Revolution 是什么

Revolution 是一个 Electron 应用框架，采用不同的方式：

- **没有类，没有装饰器** — 纯函数 + 文件模块
- **IPC 类型从代码生成** — 写一个 handler，跑一条命令，渲染进程自动获得完整类型
- **插件系统** — 把功能封装为可安装/卸载的独立单元
- **CLI 脚手架** — 一条命令生成窗口、插件、IPC 模块

---

## 快速开始

### 创建新项目

```bash
npx electron-revolution create my-app
cd my-app
pnpm install
pnpm dev
```

### 或者克隆仓库

```bash
git clone https://github.com/user/electron-revolution.git
cd electron-revolution
pnpm install
pnpm dev
```

---

## CLI 命令

| 命令 | 作用 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 + electron-builder 打包 |
| `pnpm gen:ipc` | 从主进程 handler 生成渲染进程 IPC 类型 |
| `pnpm add:window <name>` | 生成新窗口（主进程 + 渲染进程） |
| `pnpm add:plugin <name>` | 生成新插件 |
| `pnpm add:ipc <name>` | 生成新 IPC 模块 |

---

## IPC 工作原理

Revolution 有 3 个 IPC 方向，全部类型安全：

| 方向 | 主进程 API | 渲染进程 API | 定义方式 |
|------|-----------|-------------|---------|
| 渲染 → 主（有返回值） | `ipcMain.handle` | `ipcInvoke(channel, ...args)` | `defineHandlers` |
| 渲染 → 主（无返回值） | `ipcMain.on` | `ipcSend(channel, ...args)` | `defineListeners` |
| 主 → 渲染 | `webContents.send` | `ipcOn(channel, listener)` | `defineSenders` |

### 第 1 步：在主进程定义 handler

```ts
// main-process/ipc/user.ts
import { defineHandlers, defineListeners } from "../core/ipc";

// 渲染进程调用，主进程返回结果
export const userHandlers = defineHandlers({
  "user:get": (_, id: string) => ({ id, name: "Alice" }),
  "user:list": () => [{ id: "1", name: "Alice" }],
});

// 渲染进程发送，主进程接收（无返回）
export const userListeners = defineListeners({
  "user:delete": (_, id: string) => {
    console.log("deleting user:", id);
  },
});
```

### 第 2 步：注册

```ts
// main-process/ipc/index.ts
import { registerRoutes } from "../core/ipc";
import { userHandlers, userListeners } from "./user";

export const registerAllIpc = () => {
  registerRoutes(userHandlers.routes);
  registerRoutes(userListeners.routes);
};
```

### 第 3 步：生成类型

```bash
pnpm gen:ipc
```

读取 handler 代码，生成 `renderer-process/shared/services/ipc.generated.ts`。

### 第 4 步：渲染进程调用

```ts
import { ipcInvoke, ipcSend } from "@renderer-process/shared/services/ipc";

const user = await ipcInvoke("user:get", "123");
//    ^? { id: string; name: string }  ← 自动推导

ipcSend("user:delete", "123");
//                      ^? string  ← 类型检查
```

### 主 → 渲染

```ts
// 定义
import { defineSenders } from "../core/ipc";
export const senders = defineSenders({
  "store:changed": (_value: StoreOptions) => {},
});

// 主进程发送
import { sendToWindow } from "./core/window";
sendToWindow("main", "store:changed", newValue);

// 渲染进程监听
import { ipcOn } from "@renderer-process/shared/services/ipc";
ipcOn("store:changed", (_, value) => { /* ... */ });
```

---

## 插件系统

插件是一个**独立的功能模块**。它可以注册 IPC 路由、窗口、命令，然后在运行时安装或卸载。

### 什么时候用插件

- 你想添加一个可以开关的功能
- 你想跨项目共享一个功能
- 你想把某个功能的代码和其他代码隔离

### 定义插件

```ts
import { definePlugin, defineHandlers } from "../../core";

const handlers = defineHandlers({
  "screenshot:capture": () => "/path/to/file.png",
});

export const screenshotPlugin = definePlugin({
  meta: { name: "screenshot", version: "1.0.0" },
  setup(ctx) {
    ctx.ipc(handlers.routes);
    ctx.log.info("screenshot ready");
    return () => ctx.log.info("screenshot removed");
  },
});
```

### 安装插件

```ts
import { installPlugin } from "./core";
import { screenshotPlugin } from "./plugins/screenshot";

await installPlugin(screenshotPlugin);
```

### 插件上下文 API

| 方法 | 作用 |
|------|------|
| `ctx.ipc(routes)` | 注册 IPC 路由（所有窗口都能调用） |
| `ctx.window(name, factory)` | 注册新窗口 |
| `ctx.command(id, handler)` | 注册命名命令 |
| `ctx.on(event, handler)` | 监听内部事件 |
| `ctx.emit(event, ...args)` | 发布内部事件 |
| `ctx.use<T>(pluginName)` | 访问其他插件暴露的 API |
| `ctx.log.info/warn/error` | 带作用域的日志 |

### 插件间通信

```ts
// 插件 A 暴露 API
export const pluginA = definePlugin({
  meta: { name: "plugin-a", version: "1.0.0" },
  api: { getData: () => [1, 2, 3] },
  setup(ctx) { /* ... */ },
});

// 插件 B 使用插件 A 的 API
export const pluginB = definePlugin({
  meta: { name: "plugin-b", version: "1.0.0", dependencies: ["plugin-a"] },
  setup(ctx) {
    const a = ctx.use<{ getData: () => number[] }>("plugin-a");
    console.log(a?.getData()); // [1, 2, 3]
  },
});
```

---

## 添加窗口

```bash
pnpm add:window settings
```

生成：

```
main-process/windows/settings.ts          ← 窗口工厂函数
renderer-process/windows/settings/
├── App.tsx                                ← React 组件
├── main.tsx                               ← 入口
└── index.html                             ← HTML 模板
```

然后注册到 `windows/index.ts` 和 `vite.config.ts`。

---

## DevTools（仅开发环境）

开发模式自动加载 DevTools 插件。主窗口点击 **🛠 DevTools** 按钮打开。

显示内容：
- **Overview** — 内存、运行时间、计数
- **Plugins** — 已安装插件及状态
- **IPC Log** — 每次 IPC 调用的时间戳、方向（handle/on）、channel 名
- **Windows** — 所有已注册窗口

所有 IPC 调用（包括插件注册的）都会被记录。

---

## 项目结构

```
main-process/
├── core/               框架核心（ipc、window、plugin、logger、hot-reload）
├── ipc/                IPC 模块（按功能拆分）
├── windows/            窗口工厂函数
├── plugins/            插件目录
├── electron-store/     持久化配置
├── constant/           应用常量
└── main.ts             入口

renderer-process/
├── shared/services/    IPC 客户端（自动生成类型）
└── windows/            窗口 UI（React + Tailwind）

cli/                    代码生成器
```

---

## 技术栈

Electron 37 · Vite 6 · React 19 · TypeScript 5.9 · Tailwind CSS 4 · Biome · electron-builder

---

## 本地测试 CLI

```bash
# 全局链接
pnpm link --global

# 在任意目录
revolution create test-app
cd test-app
pnpm install
pnpm dev

# 测试完取消链接
pnpm unlink --global
```

或者不全局链接：

```bash
npx tsx cli/index.ts create test-app
```

---

## License

MIT
