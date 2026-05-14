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

### 💡 这是什么

Revolution 是一个**函数式、插件化**的 Electron 应用框架。

不同于传统 Electron 模板项目，Revolution 的核心创新在于：

1. **🔌 插件化架构** — 所有功能以插件形式存在，支持热插拔、依赖管理、插件间通信
2. **🧠 IPC 类型零手写** — 主进程写 handler，一条命令自动生成渲染进程的完整类型
3. **🛠 CLI 代码生成** — 窗口、插件、IPC 模块一键生成，结构统一
4. **📦 纯函数式设计** — 没有类，没有装饰器，模块化靠文件组织而非语法糖

### 🚀 创新点

| 特性 | 传统方案 | Revolution |
|------|----------|------------|
| IPC 类型 | 手写 `.d.ts` 声明文件，容易和实现不同步 | `pnpm gen:ipc` 从 handler 自动推导，零手写 |
| 功能扩展 | 直接改主进程代码，耦合严重 | 插件系统，`definePlugin` + `setup` 函数 |
| 新增窗口 | 手动创建 5+ 个文件，容易遗漏 | `pnpm add:window settings` 一条命令 |
| 代码组织 | 装饰器 + 类继承，为了模式而模式 | 纯函数 + 文件模块，简单直接 |
| 插件通信 | 无标准方案 | EventBus + 插件 API 暴露 |

### 📁 项目结构

```
main-process/
├── core/                 # 🧱 框架核心
│   ├── ipc.ts            #    defineHandlers / defineListeners
│   ├── window.ts         #    窗口注册与管理
│   ├── plugin.ts         #    插件生命周期
│   ├── event-bus.ts      #    事件总线
│   └── logger.ts         #    日志
├── ipc/                  # 📡 IPC 模块（按功能拆分）
│   ├── window.ts         #    窗口操作
│   └── store.ts          #    持久化存储
├── windows/              # 🪟 窗口工厂函数
├── plugins/              # 🔌 插件目录
└── main.ts               # 🚪 入口

renderer-process/
├── shared/
│   └── services/
│       └── ipc.generated.ts  # ⚙️ 自动生成的类型安全 IPC
└── windows/              # 📄 各窗口页面

cli/                      # 🛠 CLI 工具
├── index.ts              #    代码生成器
└── generate-ipc-types.ts #    IPC 类型生成器
```

### 🔧 快速开始

```bash
pnpm install
pnpm dev
```

### 📋 CLI 命令

```bash
pnpm add:window settings      # 🪟 添加窗口
pnpm add:plugin file-manager  # 🔌 添加插件
pnpm add:ipc auth             # 📡 添加 IPC 模块
pnpm gen:ipc                  # ⚙️ 生成渲染进程 IPC 类型
pnpm cli create my-app        # 📦 创建新项目
```

### 🧩 核心用法

**定义 IPC（主进程）**

```ts
import { defineHandlers } from "../core/ipc";

export const userHandlers = defineHandlers({
  "user:get": (_, id: string) => ({ id, name: "test" }),
  "user:list": () => [{ id: "1", name: "test" }],
});
```

**渲染进程调用（自动生成类型）**

```ts
import { ipcInvoke } from "@renderer-process/shared/services/ipc";

const user = await ipcInvoke("user:get", "123");
// ✅ user 类型自动推导为 { id: string; name: string }
```

**定义插件**

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

### 📖 开发流程

```
1. 写 handler  →  defineHandlers({ "channel": handler })
2. 注册        →  ipc/index.ts 中 registerRoutes()
3. 生成类型    →  pnpm gen:ipc
4. 渲染进程调用 →  ipcInvoke("channel", args)  ← 完整类型提示
```

---

## 📄 License

MIT
