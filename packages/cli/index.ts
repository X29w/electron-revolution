#!/usr/bin/env node

/**
 * @description [zh-CN] Revolution CLI — 代码生成工具，支持创建项目、窗口、插件、IPC 模块
 * @description [zh-TW] Revolution CLI — 程式碼生成工具，支援建立專案、視窗、插件、IPC 模組
 * @description [en] Revolution CLI — code generator for creating projects, windows, plugins, and IPC modules
 * @description [ja] Revolution CLI — プロジェクト、ウィンドウ、プラグイン、IPC モジュールを生成するコードジェネレーター
 */

import { resolve, dirname } from "node:path";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { TEMPLATE_FILES } from "./template-files";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const command = args[0];
const subCommand = args[1];
const name = args[2];
const flags = args.filter((a) => a.startsWith("--"));

// ---- 终端颜色 ----

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

const log = {
  title: (msg: string) => console.log(`\n${c.bold}${c.cyan}  ⚡ ${msg}${c.reset}\n`),
  step: (msg: string) => console.log(`${c.green}  ✓${c.reset} ${msg}`),
  warn: (msg: string) => console.log(`${c.yellow}  ⚠${c.reset} ${msg}`),
  error: (msg: string) => console.error(`${c.red}  ✗${c.reset} ${msg}`),
  info: (msg: string) => console.log(`${c.dim}  ${msg}${c.reset}`),
  blank: () => console.log(),
};

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

let silent = false;

function write(path: string, content: string) {
  ensureDir(resolve(path, ".."));
  writeFileSync(path, content);
  if (!silent) console.log(`  ${c.green}✓${c.reset} ${path}`);
}

// ---- 生成器 ----

/**
 * @description [zh-CN] 生成窗口（主进程工厂 + 渲染进程页面）
 * @description [zh-TW] 生成視窗（主程序工廠 + 渲染程序頁面）
 * @description [en] Generate window (main process factory + renderer page)
 * @description [ja] ウィンドウを生成（メインプロセスファクトリ + レンダラーページ）
 */
function generateWindow(windowName: string) {
  console.log(`\n  ⚡ Adding window: ${windowName}\n`);

  const factoryName = `create${toPascalCase(windowName)}Window`;

  write(
    resolve("main-process/windows", `${windowName}.ts`),
    `import { BrowserWindow } from "electron";
import { IS_DEV, PRELOAD_PATH, VITE_DEV_SERVER_URL } from "../constant";
import { getRendererPath } from "../utils/renderer-path";

export function ${factoryName}(): BrowserWindow {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
    },
  });

  if (IS_DEV) {
    win.loadURL(\`\${VITE_DEV_SERVER_URL}renderer-process/windows/${windowName}/\`);
  } else {
    win.loadFile(getRendererPath("${windowName}"));
  }

  return win;
}
`
  );

  const rendererDir = `renderer-process/windows/${windowName}`;

  write(
    resolve(rendererDir, "App.tsx"),
    `import { FC } from "react";

const App: FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <h1 className="text-2xl font-bold">${toPascalCase(windowName)}</h1>
    </div>
  );
};

export default App;
`
  );

  write(
    resolve(rendererDir, "main.tsx"),
    `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../../shared/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
  );

  write(
    resolve(rendererDir, "index.html"),
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${toPascalCase(windowName)}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
`
  );

  console.log(`
  Next steps:
  1. Add to main-process/windows/index.ts:
     import { ${factoryName} } from "./${windowName}";
     // Add to windows: "${windowName}": ${factoryName}

  2. Add to vite.config.ts rollupOptions.input:
     "${windowName}": resolve(__dirname, "renderer-process/windows/${windowName}/index.html")
  `);
}

/**
 * @description [zh-CN] 生成插件骨架
 * @description [zh-TW] 生成插件骨架
 * @description [en] Generate plugin scaffold
 * @description [ja] プラグインスキャフォールドを生成
 */
function generatePlugin(pluginName: string) {
  console.log(`\n  ⚡ Adding plugin: ${pluginName}\n`);

  const varName = `${toCamelCase(pluginName)}Plugin`;

  write(
    resolve(`main-process/plugins/${pluginName}`, "index.ts"),
    `/**
 * @description [zh-CN] 插件: ${pluginName}
 * @description [zh-TW] 插件: ${pluginName}
 * @description [en] Plugin: ${pluginName}
 * @description [ja] プラグイン: ${pluginName}
 */

import { definePlugin, defineHandlers, defineListeners } from "../../core";

const handlers = defineHandlers({
  "${pluginName}:hello": (_, name: string) => {
    return \`Hello from ${pluginName}, \${name}!\`;
  },
});

const listeners = defineListeners({
  "${pluginName}:action": (_, data: string) => {
    console.log("[${pluginName}] action:", data);
  },
});

export const ${varName} = definePlugin({
  meta: {
    name: "${pluginName}",
    version: "1.0.0",
    description: "${toPascalCase(pluginName)} plugin",
  },
  setup(ctx) {
    ctx.ipc(handlers.routes);
    ctx.ipc(listeners.routes);

    ctx.command("${pluginName}:run", () => {
      ctx.log.info("Command executed!");
    });

    ctx.log.info("activated");
  },
});
`
  );

  console.log(`
  Next steps:
  1. Install in main-process/main.ts:
     import { ${varName} } from "./plugins/${pluginName}";
     await installPlugin(${varName});

  2. Run \`pnpm gen:ipc\` to update renderer types
  `);
}

/**
 * @description [zh-CN] 生成 IPC 模块
 * @description [zh-TW] 生成 IPC 模組
 * @description [en] Generate IPC module
 * @description [ja] IPC モジュールを生成
 */
function generateIpc(moduleName: string) {
  console.log(`\n  ⚡ Adding IPC module: ${moduleName}\n`);

  const handlersName = `${toCamelCase(moduleName)}Handlers`;
  const listenersName = `${toCamelCase(moduleName)}Listeners`;

  write(
    resolve("main-process/ipc", `${moduleName}.ts`),
    `/**
 * @description [zh-CN] IPC: ${toPascalCase(moduleName)}
 * @description [zh-TW] IPC: ${toPascalCase(moduleName)}
 * @description [en] IPC: ${toPascalCase(moduleName)}
 * @description [ja] IPC: ${toPascalCase(moduleName)}
 */

import { defineHandlers, defineListeners } from "../core/ipc";

export const ${handlersName} = defineHandlers({
  "${moduleName}:get": (_, id: string) => {
    // TODO: implement
    return { id, data: null as any };
  },
  "${moduleName}:list": () => {
    // TODO: implement
    return [] as any[];
  },
});

export const ${listenersName} = defineListeners({
  "${moduleName}:create": (_, data: any) => {
    // TODO: implement
    console.log("[${moduleName}] create:", data);
  },
  "${moduleName}:delete": (_, id: string) => {
    // TODO: implement
    console.log("[${moduleName}] delete:", id);
  },
});
`
  );

  console.log(`
  Next steps:
  1. Register in main-process/ipc/index.ts:
     import { ${handlersName}, ${listenersName} } from "./${moduleName}";
     registerRoutes(${handlersName}.routes);
     registerRoutes(${listenersName}.routes);

  2. Run \`pnpm gen:ipc\` to update renderer types
  `);
}

/**
 * @description [zh-CN] 生成新项目 — 从当前模板复制完整可运行项目
 * @description [zh-TW] 生成新專案 — 從當前範本複製完整可執行專案
 * @description [en] Generate a new project — copies full runnable project from template
 * @description [ja] 新規プロジェクトを生成 — テンプレートから完全に実行可能なプロジェクトをコピー
 */
function generateProject(projectName: string) {
  log.title(`Creating project: ${c.bold}${projectName}`);

  const dir = resolve(process.cwd(), projectName);
  if (existsSync(dir)) {
    log.error(`Directory "${projectName}" already exists`);
    process.exit(1);
  }

  const templateRoot = resolve(__dirname, "..");
  let fileCount = 0;
  silent = true;

  for (const file of TEMPLATE_FILES) {
    const src = resolve(templateRoot, file);
    if (!existsSync(src)) continue;
    let content = readFileSync(src, "utf-8");

    if (file === "package.json") {
      const pkg = JSON.parse(content);
      pkg.name = projectName;
      pkg.version = "0.1.0";
      delete pkg.bin;
      pkg.scripts = { dev: pkg.scripts.dev, build: pkg.scripts.build };
      if (flags.includes("--local")) {
        pkg.dependencies["@revolution/core"] = `link:${resolve(templateRoot, "main-process/core")}`;
      } else {
        pkg.dependencies["@revolution/core"] = "^0.2.0";
      }
      content = JSON.stringify(pkg, null, 2);
    }

    write(resolve(dir, file), content);
    fileCount++;
  }

  silent = false;
  log.blank();
  log.step(`Scaffolded ${c.bold}${fileCount}${c.reset} files into ${c.cyan}./${projectName}${c.reset}`);
  log.blank();
  console.log(`  ${c.dim}Next steps:${c.reset}`);
  log.blank();
  console.log(`    ${c.cyan}$${c.reset} cd ${projectName}`);
  console.log(`    ${c.cyan}$${c.reset} pnpm install`);
  console.log(`    ${c.cyan}$${c.reset} pnpm dev`);
  log.blank();
}

// ---- 帮助 ----

function printHelp() {
  console.log(`
  ${c.bold}${c.cyan}⚡ Revolution CLI${c.reset}

  ${c.dim}Usage:${c.reset}
    ${c.cyan}revolution create${c.reset} <name>         Create a new project
    ${c.cyan}revolution add window${c.reset} <name>     Add a window
    ${c.cyan}revolution add plugin${c.reset} <name>     Add a plugin
    ${c.cyan}revolution add ipc${c.reset} <name>        Add an IPC module
    ${c.cyan}revolution gen:ipc${c.reset}               Generate renderer IPC types

  ${c.dim}Examples:${c.reset}
    ${c.dim}$${c.reset} revolution create my-app
    ${c.dim}$${c.reset} revolution add window settings
    ${c.dim}$${c.reset} revolution add plugin file-manager
  `);
}

// ---- 路由 ----

switch (command) {
  case "create":
    if (!subCommand) {
      console.error("Usage: revolution create <project-name>");
      process.exit(1);
    }
    generateProject(subCommand);
    break;

  case "add":
    if (!subCommand || !name) {
      console.error("Usage: revolution add <window|plugin|ipc> <name>");
      process.exit(1);
    }
    switch (subCommand) {
      case "window":
        generateWindow(name);
        break;
      case "plugin":
        generatePlugin(name);
        break;
      case "ipc":
        generateIpc(name);
        break;
      default:
        console.error(`Unknown type: ${subCommand}`);
        process.exit(1);
    }
    break;

  case "gen:ipc":
    execSync(`npx tsx "${resolve(__dirname, "generate-ipc-types.ts")}"`, { stdio: "inherit", cwd: process.cwd() });
    break;

  case "help":
  case "--help":
  case "-h":
  case undefined:
    printHelp();
    break;

  default:
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
}
