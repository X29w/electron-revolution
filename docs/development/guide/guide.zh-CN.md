# 贡献者指南

本指南涵盖 `x-elevolution` monorepo 的本地开发、代码规范和发布流程。

## 前置条件

- **Node.js** ≥ 20
- **pnpm** ≥ 9.15（通过 `corepack enable` 激活）
- **Git**

## 仓库结构

```
x-elevolution/
├── packages/
│   ├── core/          → @x-elevolution/core（运行时框架，发布到 npm）
│   └── cli/           → @x-elevolution/cli（脚手架工具，发布到 npm）
├── apps/
│   └── electron-app/  → 示例应用（同时作为 CLI 模板源）
├── docs/              → 文档
├── turbo.json         → Turborepo 管道配置
├── pnpm-workspace.yaml
└── package.json       → 工作区根目录
```

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/user/x-elevolution.git
cd x-elevolution

# 安装依赖
pnpm install

# 启动开发（运行带 HMR 的示例应用）
pnpm dev
```

`pnpm dev` 命令使用 Turborepo 启动 `apps/electron-app` 中的示例 Electron 应用，并启用 Vite HMR。

## 开发工作流

### 开发 `@x-elevolution/core`

core 包位于 `packages/core/`。它没有构建步骤——直接导出 TypeScript 源码（通过 `"main": "./index.ts"` 消费）。

```bash
# 示例应用通过 workspace 协议直接导入 core
# 对 packages/core/ 的任何修改都会立即反映在运行中的应用中
pnpm dev
```

**模块结构：**

| 文件 | 职责 |
|---|---|
| `index.ts` | 公共导出（桶文件） |
| `ipc.ts` | IPC 定义、注册、中间件、拦截器 |
| `window.ts` | 窗口注册表、生命周期钩子、消息传递 |
| `plugin.ts` | 插件定义、安装、上下文、命令 |
| `event-bus.ts` | 用于插件间通信的 EventBus |
| `logger.ts` | 可替换的日志器（基于 Proxy） |
| `hot-reload.ts` | 开发环境下插件热重载的文件监听器 |

**向 core 添加新功能：**

1. 创建或修改相关模块文件
2. 从 `index.ts` 导出新符号
3. 添加 4 种语言的 JSDoc 注释（zh-CN、zh-TW、en、ja）
4. 在示例应用中测试（`apps/electron-app`）
5. 更新文档

### 开发 `@x-elevolution/cli`

CLI 包位于 `packages/cli/`。

```bash
# 本地测试 CLI
cd packages/cli
node bin.mjs create test-project --local

# 或从工作区根目录
pnpm --filter @x-elevolution/cli exec node bin.mjs --help
```

**模块结构：**

| 文件 | 职责 |
|---|---|
| `bin.mjs` | 入口文件（shebang，通过 tsx 导入 index.ts） |
| `index.ts` | CLI 逻辑——命令路由、生成器 |
| `template-files.ts` | `create` 命令复制的文件列表 |
| `generate-ipc-types.ts` | `gen:ipc` 的类型生成逻辑 |

**添加新的 CLI 命令：**

1. 在 `index.ts` 中添加命令处理函数
2. 在 `switch (command)` 块中添加 case
3. 更新 `printHelp()` 输出
4. 如果命令需要生成文件，按照现有模式添加生成器函数
5. 使用 `node bin.mjs <your-command>` 测试

### 开发示例应用

`apps/electron-app/` 中的示例应用有双重用途：
- **开发沙盒**：用于测试 core 功能
- **模板源**：用于 CLI 的 `create` 命令

对示例应用的任何结构性修改都应同步反映到 `packages/cli/template-files.ts` 中。

## 代码规范

### 函数式风格

本项目采用纯函数式风格。不使用类，不使用装饰器。

```ts
// ✅ 正确
export const myFunction = (arg: string): Result => { ... };

// ❌ 错误
export class MyService {
  constructor() { ... }
}
```

### 多语言注释

所有面向公共的代码必须包含 4 种语言的 JSDoc 注释：

```ts
/**
 * @description [zh-CN] 中文简体描述
 * @description [zh-TW] 中文繁體描述
 * @description [en] English description
 * @description [ja] 日本語の説明
 */
export const myFunction = () => { ... };
```

### 命名规范

| 类型 | 规范 | 示例 |
|---|---|---|
| 函数 | camelCase | `defineHandlers`, `registerRoutes` |
| 类型/接口 | PascalCase | `IpcRoute`, `PluginContext` |
| 常量 | UPPER_SNAKE_CASE | `IS_DEV`, `PRELOAD_PATH` |
| 文件 | kebab-case | `event-bus.ts`, `hot-reload.ts` |
| IPC 通道 | `namespace:action` | `"user:get"`, `"store:set"` |
| 插件名称 | kebab-case | `"file-manager"`, `"devtools"` |

### 导出模式

只使用命名导出。不使用默认导出。

```ts
// ✅ 正确
export const definePlugin = (def: PluginDef): PluginDef => def;

// ❌ 错误
export default function definePlugin(def: PluginDef) { ... }
```

### 类型导出

类型与其实现一起导出：

```ts
export type IpcMiddleware = (...) => any;
export const useIpcMiddleware = (middleware: IpcMiddleware) => { ... };
```

## 代码检查与格式化

项目使用 [Biome](https://biomejs.dev/) 进行代码检查和格式化。

```bash
# 检查
pnpm lint

# 格式化（在示例应用中）
cd apps/electron-app
npx biome check --write .
```

Biome 配置位于 `apps/electron-app/biome.json`。

## 测试

### 手动测试

由于这是一个 Electron 框架，大部分测试通过运行示例应用完成：

```bash
pnpm dev
```

验证项目：
- IPC 调用正常工作（检查 DevTools 面板）
- 插件正确加载（检查控制台输出）
- 窗口正常打开/关闭
- 插件文件变更时触发热重载

### 测试 CLI

```bash
# 创建测试项目
cd /tmp
node /path/to/packages/cli/bin.mjs create test-app --local
cd test-app
pnpm install
pnpm dev
```

## 发布

### 版本升级

两个包应同步升级版本：

```bash
# 更新两个包的版本
cd packages/core && npm version patch
cd packages/cli && npm version patch
```

### 发布到 npm

```bash
# 先发布 core（cli 在概念上依赖它）
cd packages/core
npm publish --access public

# 然后发布 cli
cd packages/cli
npm publish --access public
```

### 发布前检查清单

- [ ] 新导出的符号都包含 4 种语言的注释
- [ ] `packages/core/index.ts` 导出了所有新的公共符号
- [ ] `packages/cli/template-files.ts` 与示例应用保持同步
- [ ] 文档已更新（README + docs/）
- [ ] 两个 `package.json` 文件的版本号已升级
- [ ] 示例应用通过 `pnpm dev` 可以正常运行
- [ ] `x-elevolution create test --local` 能生成可运行的项目

## Turborepo 管道

`turbo.json` 定义了构建管道：

- `dev` — 以开发模式启动示例应用
- `build` — 构建所有包（如适用）
- `lint` — 在整个工作区运行代码检查

## Git 工作流

1. 创建功能分支：`git checkout -b feat/my-feature`
2. 按照代码规范进行修改
3. 在示例应用中测试
4. 使用约定式提交：`feat:`、`fix:`、`docs:`、`refactor:`
5. 推送并创建 Pull Request

## 故障排除

### `pnpm dev` 报模块未找到错误

```bash
# 清理并重新安装
rm -rf node_modules apps/electron-app/node_modules packages/*/node_modules
pnpm install
```

### CLI `create` 生成了过时的文件

更新 `packages/cli/template-files.ts`，将示例应用中新增的文件包含进去。

### 热重载未触发

确保 `IS_DEV` 为 `true`，且插件使用 `installPluginHot`（而非 `installPlugin`）安装。

### IPC 类型未生成

从项目根目录（或应用目录）运行 `pnpm gen:ipc`。确保所有 handler 文件使用了 `@x-elevolution/core` 中的 `defineHandlers` / `defineListeners`。
