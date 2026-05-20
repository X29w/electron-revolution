# @x-industry/elevolution-cli — 文件

`@x-industry/elevolution-cli` 腳手架和程式碼生成工具的完整文件。

**版本：** 0.2.0  
**授權條款：** MIT  
**安裝：** `npm install -g @x-industry/elevolution-cli` 或透過 `npx @x-industry/elevolution-cli` 使用

---

## 目錄

- [概述](#概述)
- [安裝](#安裝)
- [命令](#命令)
  - [create](#elevolution-create-name)
  - [add window](#elevolution-add-window-name)
  - [add plugin](#elevolution-add-plugin-name)
  - [add ipc](#elevolution-add-ipc-name)
  - [gen:ipc](#elevolution-genipc)
- [範本系統](#範本系統)
- [`create` 內部工作原理](#create-內部工作原理)
- [生成檔案詳情](#生成檔案詳情)
- [設定與旗標](#設定與旗標)
- [擴展 CLI](#擴展-cli)

---

## 概述

`@x-industry/elevolution-cli` 是一個程式碼生成工具，功能包括：

1. **搭建完整的 Electron 專案**，採用 Elevolution 架構
2. **生成視窗**（主程序工廠 + 渲染程序頁面 + HTML 進入點）
3. **生成插件**，包含正確的結構和樣板程式碼
4. **生成 IPC 模組**，包含 handler 和 listener 定義
5. **自動生成渲染程序 IPC 型別**，基於主程序 handler 定義

CLI 旨在消除重複的設定工作，並強制保持一致的專案結構。

---

## 安裝

```bash
# 透過 npx 直接使用（推薦）
npx @x-industry/elevolution-cli create my-app

# 或全域安裝
npm install -g @x-industry/elevolution-cli
elevolution create my-app

# 或作為開發依賴安裝
pnpm add -D @x-industry/elevolution-cli
```

---

## 命令

### `elevolution create <name>`

搭建一個完整的、可執行的 Electron 專案。

```bash
elevolution create my-app
elevolution create my-app --local
```

**參數：**
- `<name>` — 專案目錄名稱（同時用作 package name）

**旗標：**
- `--local` — 將 `@x-industry/elevolution-core` 連結到本地 monorepo 路徑而非 npm 版本。用於開發。

**生成內容：**

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

### `elevolution add window <name>`

生成一個新視窗，包含主程序工廠和渲染程序頁面。

```bash
elevolution add window settings
elevolution add window file-browser
```

**參數：**
- `<name>` — 視窗名稱，使用 kebab-case

**生成的檔案：**

1. **`main-process/windows/<name>.ts`** — 視窗工廠函數
2. **`renderer-process/windows/<name>/App.tsx`** — React 元件
3. **`renderer-process/windows/<name>/main.tsx`** — React 進入點
4. **`renderer-process/windows/<name>/index.html`** — HTML 進入點

---

### `elevolution add plugin <name>`

生成插件腳手架，包含 IPC handler、listener 和正確的結構。

```bash
elevolution add plugin file-manager
elevolution add plugin auth
```

**參數：**
- `<name>` — 插件名稱，使用 kebab-case

**生成的檔案：** `main-process/plugins/<name>/index.ts`

---

### `elevolution add ipc <name>`

生成一個 IPC 模組，包含 handler 和 listener 定義。

```bash
elevolution add ipc user
elevolution add ipc notification
```

**參數：**
- `<name>` — 模組名稱，使用 kebab-case

**生成的檔案：** `main-process/ipc/<name>.ts`

---

### `elevolution gen:ipc`

從主程序 handler 實作自動生成渲染程序 IPC 型別定義。

```bash
elevolution gen:ipc
```

**工作原理：**
1. 掃描 `main-process/` 中所有檔案的 `defineHandlers` 和 `defineListeners` 呼叫
2. 提取通道名稱、參數型別和回傳型別
3. 生成 `renderer-process/shared/services/ipc.generated.ts`

---

## 範本系統

CLI 的 `create` 命令從 monorepo 中的範例應用（`apps/electron-app/`）複製檔案。

### 範本檔案清單

`packages/cli/template-files.ts` 檔案匯出一個 `TEMPLATE_FILES` 陣列，包含所有要複製的相對路徑。

### 更新範本

當你向範例應用新增了應包含在腳手架專案中的檔案時：

1. 將檔案新增到 `apps/electron-app/`
2. 將相對路徑新增到 `packages/cli/template-files.ts` 的 `TEMPLATE_FILES` 中
3. 使用 `elevolution create test-project --local` 測試

### 範本轉換

在 `create` 過程中，CLI 對 `package.json` 套用以下轉換：
- 將 `name` 設定為專案名稱
- 將 `version` 設定為 `0.1.0`
- 移除 `bin` 欄位
- 僅保留 `dev` 和 `build` 腳本
- 將 `@x-industry/elevolution-core` 依賴設定為 `^0.2.0`（使用 `--local` 時為本地連結）

---

## 生成檔案詳情

### 視窗生成器命名

| 輸入 | 工廠名稱 | 元件名稱 |
|---|---|---|
| `settings` | `createSettingsWindow` | `Settings` |
| `file-browser` | `createFileBrowserWindow` | `FileBrowser` |
| `child-a` | `createChildAWindow` | `ChildA` |

轉換規則：
- 工廠：`create` + PascalCase(name) + `Window`
- 元件：PascalCase(name)

### 插件生成器命名

| 輸入 | 變數名稱 |
|---|---|
| `file-manager` | `fileManagerPlugin` |
| `auth` | `authPlugin` |
| `devtools` | `devtoolsPlugin` |

轉換規則：camelCase(name) + `Plugin`

### IPC 生成器命名

| 輸入 | Handlers 變數 | Listeners 變數 |
|---|---|---|
| `user` | `userHandlers` | `userListeners` |
| `file-system` | `fileSystemHandlers` | `fileSystemListeners` |

轉換規則：camelCase(name) + `Handlers` / `Listeners`

---

## 設定與旗標

### 全域旗標

| 旗標 | 命令 | 描述 |
|---|---|---|
| `--local` | `create` | 將 core 連結到本地 monorepo 路徑 |
| `--help`, `-h` | 任意 | 顯示說明資訊 |

### 環境要求

CLI 使用 `tsx` 直接執行 TypeScript。需要：
- Node.js ≥ 20
- `tsx`（作為依賴打包）
- `typescript`（作為依賴打包）

---

## 擴展 CLI

### 新增命令

1. 在 `packages/cli/index.ts` 中新增處理函數
2. 新增到 switch 陳述式
3. 更新 `printHelp()`

### 檔案寫入工具函數

CLI 提供以下內部工具函數：

```ts
write(path: string, content: string): void
toPascalCase(str: string): string
toCamelCase(str: string): string
ensureDir(dir: string): void
```

---

## 發佈

### 發佈前檢查清單

- [ ] `template-files.ts` 包含範例應用中的所有檔案
- [ ] 所有生成器產出有效的、可執行的程式碼
- [ ] `gen:ipc` 能正確解析 handler 定義
- [ ] `create --local` 能生成可執行的專案
- [ ] `create`（不帶 --local）參照正確的 npm 版本
- [ ] `package.json` 中的版本已升級

### 發佈命令

```bash
cd packages/cli
npm publish --access public
```