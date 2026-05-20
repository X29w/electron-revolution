# 貢獻者指南

本指南涵蓋 `elevolution` monorepo 的本地開發、程式碼規範和發佈流程。

## 前置條件

- **Node.js** ≥ 20
- **pnpm** ≥ 9.15（透過 `corepack enable` 啟用）
- **Git**

## 倉庫結構

```
elevolution/
├── packages/
│   ├── core/          → @x-industry/elevolution-core（執行時框架，發佈到 npm）
│   └── cli/           → @x-industry/elevolution-cli（腳手架工具，發佈到 npm）
├── apps/
│   └── electron-app/  → 範例應用（同時作為 CLI 範本來源）
├── docs/              → 文件
├── turbo.json         → Turborepo 管道設定
├── pnpm-workspace.yaml
└── package.json       → 工作區根目錄
```

## 快速開始

```bash
# 複製倉庫
git clone https://github.com/user/elevolution.git
cd elevolution

# 安裝依賴
pnpm install

# 啟動開發（執行帶 HMR 的範例應用）
pnpm dev
```

`pnpm dev` 命令使用 Turborepo 啟動 `apps/electron-app` 中的範例 Electron 應用，並啟用 Vite HMR。

## 開發工作流

### 開發 `@x-industry/elevolution-core`

core 套件位於 `packages/core/`。它沒有建構步驟——直接匯出 TypeScript 原始碼（透過 `"main": "./index.ts"` 消費）。

```bash
# 範例應用透過 workspace 協定直接匯入 core
# 對 packages/core/ 的任何修改都會立即反映在執行中的應用中
pnpm dev
```

**模組結構：**

| 檔案 | 職責 |
|---|---|
| `index.ts` | 公共匯出（桶檔案） |
| `ipc.ts` | IPC 定義、註冊、中介軟體、攔截器 |
| `window.ts` | 視窗註冊表、生命週期鉤子、訊息傳遞 |
| `plugin.ts` | 插件定義、安裝、上下文、命令 |
| `event-bus.ts` | 用於插件間通訊的 EventBus |
| `logger.ts` | 可替換的日誌器（基於 Proxy） |
| `hot-reload.ts` | 開發環境下插件熱重載的檔案監聽器 |

**向 core 新增功能：**

1. 建立或修改相關模組檔案
2. 從 `index.ts` 匯出新符號
3. 新增 4 種語言的 JSDoc 註解（zh-CN、zh-TW、en、ja）
4. 在範例應用中測試（`apps/electron-app`）
5. 更新文件

### 開發 `@x-industry/elevolution-cli`

CLI 套件位於 `packages/cli/`。

```bash
# 本地測試 CLI
cd packages/cli
node bin.mjs create test-project --local

# 或從工作區根目錄
pnpm --filter @x-industry/elevolution-cli exec node bin.mjs --help
```

**模組結構：**

| 檔案 | 職責 |
|---|---|
| `bin.mjs` | 進入點檔案（shebang，透過 tsx 匯入 index.ts） |
| `index.ts` | CLI 邏輯——命令路由、生成器 |
| `template-files.ts` | `create` 命令複製的檔案清單 |
| `generate-ipc-types.ts` | `gen:ipc` 的型別生成邏輯 |

**新增 CLI 命令：**

1. 在 `index.ts` 中新增命令處理函數
2. 在 `switch (command)` 區塊中新增 case
3. 更新 `printHelp()` 輸出
4. 如果命令需要生成檔案，按照現有模式新增生成器函數
5. 使用 `node bin.mjs <your-command>` 測試

### 開發範例應用

`apps/electron-app/` 中的範例應用有雙重用途：
- **開發沙盒**：用於測試 core 功能
- **範本來源**：用於 CLI 的 `create` 命令

對範例應用的任何結構性修改都應同步反映到 `packages/cli/template-files.ts` 中。

## 程式碼規範

### 函數式風格

本專案採用純函數式風格。不使用類別，不使用裝飾器。

```ts
// ✅ 正確
export const myFunction = (arg: string): Result => { ... };

// ❌ 錯誤
export class MyService {
  constructor() { ... }
}
```

### 多語言註解

所有面向公共的程式碼必須包含 4 種語言的 JSDoc 註解：

```ts
/**
 * @description [zh-CN] 中文简体描述
 * @description [zh-TW] 中文繁體描述
 * @description [en] English description
 * @description [ja] 日本語の説明
 */
export const myFunction = () => { ... };
```

### 命名規範

| 型別 | 規範 | 範例 |
|---|---|---|
| 函數 | camelCase | `defineHandlers`, `registerRoutes` |
| 型別/介面 | PascalCase | `IpcRoute`, `PluginContext` |
| 常數 | UPPER_SNAKE_CASE | `IS_DEV`, `PRELOAD_PATH` |
| 檔案 | kebab-case | `event-bus.ts`, `hot-reload.ts` |
| IPC 通道 | `namespace:action` | `"user:get"`, `"store:set"` |
| 插件名稱 | kebab-case | `"file-manager"`, `"devtools"` |

### 匯出模式

只使用具名匯出。不使用預設匯出。

```ts
// ✅ 正確
export const definePlugin = (def: PluginDef): PluginDef => def;

// ❌ 錯誤
export default function definePlugin(def: PluginDef) { ... }
```

### 型別匯出

型別與其實作一起匯出：

```ts
export type IpcMiddleware = (...) => any;
export const useIpcMiddleware = (middleware: IpcMiddleware) => { ... };
```

## 程式碼檢查與格式化

專案使用 [Biome](https://biomejs.dev/) 進行程式碼檢查和格式化。

```bash
# 檢查
pnpm lint

# 格式化（在範例應用中）
cd apps/electron-app
npx biome check --write .
```

Biome 設定位於 `apps/electron-app/biome.json`。

## 測試

### 手動測試

由於這是一個 Electron 框架，大部分測試透過執行範例應用完成：

```bash
pnpm dev
```

驗證項目：
- IPC 呼叫正常運作（檢查 DevTools 面板）
- 插件正確載入（檢查主控台輸出）
- 視窗正常開啟/關閉
- 插件檔案變更時觸發熱重載

### 測試 CLI

```bash
# 建立測試專案
cd /tmp
node /path/to/packages/cli/bin.mjs create test-app --local
cd test-app
pnpm install
pnpm dev
```

## 發佈

### 版本升級

兩個套件應同步升級版本：

```bash
# 更新兩個套件的版本
cd packages/core && npm version patch
cd packages/cli && npm version patch
```

### 發佈到 npm

```bash
# 先發佈 core（cli 在概念上依賴它）
cd packages/core
npm publish --access public

# 然後發佈 cli
cd packages/cli
npm publish --access public
```

### 發佈前檢查清單

- [ ] 新匯出的符號都包含 4 種語言的註解
- [ ] `packages/core/index.ts` 匯出了所有新的公共符號
- [ ] `packages/cli/template-files.ts` 與範例應用保持同步
- [ ] 文件已更新（README + docs/）
- [ ] 兩個 `package.json` 檔案的版本號已升級
- [ ] 範例應用透過 `pnpm dev` 可以正常執行
- [ ] `elevolution create test --local` 能生成可執行的專案

## Turborepo 管道

`turbo.json` 定義了建構管道：

- `dev` — 以開發模式啟動範例應用
- `build` — 建構所有套件（如適用）
- `lint` — 在整個工作區執行程式碼檢查

## Git 工作流

1. 建立功能分支：`git checkout -b feat/my-feature`
2. 按照程式碼規範進行修改
3. 在範例應用中測試
4. 使用約定式提交：`feat:`、`fix:`、`docs:`、`refactor:`
5. 推送並建立 Pull Request

## 故障排除

### `pnpm dev` 報模組未找到錯誤

```bash
# 清理並重新安裝
rm -rf node_modules apps/electron-app/node_modules packages/*/node_modules
pnpm install
```

### CLI `create` 生成了過時的檔案

更新 `packages/cli/template-files.ts`，將範例應用中新增的檔案包含進去。

### 熱重載未觸發

確保 `IS_DEV` 為 `true`，且插件使用 `installPluginHot`（而非 `installPlugin`）安裝。

### IPC 型別未生成

從專案根目錄（或應用目錄）執行 `pnpm gen:ipc`。確保所有 handler 檔案使用了 `@x-industry/elevolution-core` 中的 `defineHandlers` / `defineListeners`。
