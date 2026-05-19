# @x-elevolution/cli — 文档

`@x-elevolution/cli` 脚手架和代码生成工具的完整文档。

**版本：** 0.2.0  
**许可证：** MIT  
**安装：** `npm install -g @x-elevolution/cli` 或通过 `npx @x-elevolution/cli` 使用

---

## 目录

- [概述](#概述)
- [安装](#安装)
- [命令](#命令)
  - [create](#x-elevolution-create-name)
  - [add window](#x-elevolution-add-window-name)
  - [add plugin](#x-elevolution-add-plugin-name)
  - [add ipc](#x-elevolution-add-ipc-name)
  - [gen:ipc](#x-elevolution-genipc)
- [模板系统](#模板系统)
- [`create` 内部工作原理](#create-内部工作原理)
- [生成文件详情](#生成文件详情)
- [配置与标志](#配置与标志)
- [扩展 CLI](#扩展-cli)

---

## 概述

`@x-elevolution/cli` 是一个代码生成工具，功能包括：

1. **搭建完整的 Electron 项目**，采用 X-Elevolution 架构
2. **生成窗口**（主进程工厂 + 渲染进程页面 + HTML 入口）
3. **生成插件**，包含正确的结构和样板代码
4. **生成 IPC 模块**，包含 handler 和 listener 定义
5. **自动生成渲染进程 IPC 类型**，基于主进程 handler 定义

CLI 旨在消除重复的配置工作，并强制保持一致的项目结构。

---

## 安装

```bash
# 通过 npx 直接使用（推荐）
npx @x-elevolution/cli create my-app

# 或全局安装
npm install -g @x-elevolution/cli
x-elevolution create my-app

# 或作为开发依赖安装
pnpm add -D @x-elevolution/cli
```

---

## 命令

### `x-elevolution create <name>`

搭建一个完整的、可运行的 Electron 项目。

```bash
x-elevolution create my-app
x-elevolution create my-app --local
```

**参数：**
- `<name>` — 项目目录名称（同时用作 package name）

**标志：**
- `--local` — 将 `@x-elevolution/core` 链接到本地 monorepo 路径而非 npm 版本。用于开发。

**生成内容：**

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

生成一个新窗口，包含主进程工厂和渲染进程页面。

```bash
x-elevolution add window settings
x-elevolution add window file-browser
```

**参数：**
- `<name>` — 窗口名称，使用 kebab-case

**生成的文件：**

1. **`main-process/windows/<name>.ts`** — 窗口工厂函数
2. **`renderer-process/windows/<name>/App.tsx`** — React 组件
3. **`renderer-process/windows/<name>/main.tsx`** — React 入口
4. **`renderer-process/windows/<name>/index.html`** — HTML 入口

---

### `x-elevolution add plugin <name>`

生成插件脚手架，包含 IPC handler、listener 和正确的结构。

```bash
x-elevolution add plugin file-manager
x-elevolution add plugin auth
```

**参数：**
- `<name>` — 插件名称，使用 kebab-case

**生成的文件：** `main-process/plugins/<name>/index.ts`

---

### `x-elevolution add ipc <name>`

生成一个 IPC 模块，包含 handler 和 listener 定义。

```bash
x-elevolution add ipc user
x-elevolution add ipc notification
```

**参数：**
- `<name>` — 模块名称，使用 kebab-case

**生成的文件：** `main-process/ipc/<name>.ts`

---

### `x-elevolution gen:ipc`

从主进程 handler 实现自动生成渲染进程 IPC 类型定义。

```bash
x-elevolution gen:ipc
```

**工作原理：**
1. 扫描 `main-process/` 中所有文件的 `defineHandlers` 和 `defineListeners` 调用
2. 提取通道名称、参数类型和返回类型
3. 生成 `renderer-process/shared/services/ipc.generated.ts`

---

## 模板系统

CLI 的 `create` 命令从 monorepo 中的示例应用（`apps/electron-app/`）复制文件。

### 模板文件列表

`packages/cli/template-files.ts` 文件导出一个 `TEMPLATE_FILES` 数组，包含所有要复制的相对路径。

### 更新模板

当你向示例应用添加了应包含在脚手架项目中的文件时：

1. 将文件添加到 `apps/electron-app/`
2. 将相对路径添加到 `packages/cli/template-files.ts` 的 `TEMPLATE_FILES` 中
3. 使用 `x-elevolution create test-project --local` 测试

### 模板转换

在 `create` 过程中，CLI 对 `package.json` 应用以下转换：
- 将 `name` 设置为项目名称
- 将 `version` 设置为 `0.1.0`
- 移除 `bin` 字段
- 仅保留 `dev` 和 `build` 脚本
- 将 `@x-elevolution/core` 依赖设置为 `^0.2.0`（使用 `--local` 时为本地链接）

---

## 生成文件详情

### 窗口生成器命名

| 输入 | 工厂名称 | 组件名称 |
|---|---|---|
| `settings` | `createSettingsWindow` | `Settings` |
| `file-browser` | `createFileBrowserWindow` | `FileBrowser` |
| `child-a` | `createChildAWindow` | `ChildA` |

### 插件生成器命名

| 输入 | 变量名称 |
|---|---|
| `file-manager` | `fileManagerPlugin` |
| `auth` | `authPlugin` |
| `devtools` | `devtoolsPlugin` |

### IPC 生成器命名

| 输入 | Handlers 变量 | Listeners 变量 |
|---|---|---|
| `user` | `userHandlers` | `userListeners` |
| `file-system` | `fileSystemHandlers` | `fileSystemListeners` |

---

## 配置与标志

### 全局标志

| 标志 | 命令 | 描述 |
|---|---|---|
| `--local` | `create` | 将 core 链接到本地 monorepo 路径 |
| `--help`, `-h` | 任意 | 显示帮助信息 |

### 环境要求

CLI 使用 `tsx` 直接执行 TypeScript。需要：
- Node.js ≥ 20
- `tsx`（作为依赖打包）
- `typescript`（作为依赖打包）

---

## 扩展 CLI

### 添加新命令

1. 在 `packages/cli/index.ts` 中添加处理函数
2. 添加到 switch 语句
3. 更新 `printHelp()`

### 文件写入工具函数

CLI 提供以下内部工具函数：

```ts
write(path: string, content: string): void
toPascalCase(str: string): string
toCamelCase(str: string): string
ensureDir(dir: string): void
```

---

## 发布

### 发布前检查清单

- [ ] `template-files.ts` 包含示例应用中的所有文件
- [ ] 所有生成器产出有效的、可运行的代码
- [ ] `gen:ipc` 能正确解析 handler 定义
- [ ] `create --local` 能生成可运行的项目
- [ ] `create`（不带 --local）引用正确的 npm 版本
- [ ] `package.json` 中的版本已升级

### 发布命令

```bash
cd packages/cli
npm publish --access public
```