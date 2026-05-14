#!/usr/bin/env node

/**
 * @description [zh-CN] Revolution CLI — 代码生成工具，支持创建项目、窗口、插件、IPC 模块
 * @description [zh-TW] Revolution CLI — 程式碼生成工具，支援建立專案、視窗、插件、IPC 模組
 * @description [en] Revolution CLI — code generator for creating projects, windows, plugins, and IPC modules
 * @description [ja] Revolution CLI — プロジェクト、ウィンドウ、プラグイン、IPC モジュールを生成するコードジェネレーター
 */

import { resolve } from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const command = args[0];
const subCommand = args[1];
const name = args[2];

// ---- 工具函数 ----

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

function write(path: string, content: string) {
  ensureDir(resolve(path, ".."));
  writeFileSync(path, content);
  console.log(`  ✓ ${path}`);
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
 * @description [zh-CN] 生成新项目
 * @description [zh-TW] 生成新專案
 * @description [en] Generate a new project
 * @description [ja] 新規プロジェクトを生成
 */
function generateProject(projectName: string) {
  console.log(`\n  ⚡ Creating project: ${projectName}\n`);

  const dir = resolve(process.cwd(), projectName);
  if (existsSync(dir)) {
    console.error(`  ✗ Directory "${projectName}" already exists`);
    process.exit(1);
  }

  write(
    resolve(dir, "package.json"),
    JSON.stringify(
      {
        name: projectName,
        private: true,
        version: "0.1.0",
        type: "module",
        scripts: {
          dev: "chcp 65001 && vite",
          build: "tsc && vite build && electron-builder",
          "gen:ipc": "npx tsx cli/generate-ipc-types.ts",
          cli: "npx tsx cli/index.ts",
          "add:window": "npx tsx cli/index.ts add window",
          "add:plugin": "npx tsx cli/index.ts add plugin",
          "add:ipc": "npx tsx cli/index.ts add ipc",
        },
        dependencies: {
          "@tailwindcss/vite": "^4.1.17",
          "electron-log": "^5.4.3",
          "electron-store": "^11.0.2",
          react: "^19.2.1",
          "react-dom": "^19.2.1",
          tailwindcss: "^4.1.17",
        },
        devDependencies: {
          "@biomejs/biome": "2.3.8",
          "@types/react": "^19.2.7",
          "@types/react-dom": "^19.2.3",
          "@vitejs/plugin-react": "^5.1.1",
          electron: "^37.2.5",
          "electron-builder": "^26.0.12",
          tsx: "^4.19.0",
          typescript: "^5.9.3",
          vite: "^6.3.5",
          "vite-plugin-electron": "^0.29.0",
          "vite-plugin-electron-renderer": "^0.14.6",
        },
        main: "dist/main-process/index.js",
      },
      null,
      2
    )
  );

  const dirs = [
    "main-process/core",
    "main-process/ipc",
    "main-process/windows",
    "main-process/plugins",
    "main-process/constant/config",
    "main-process/utils",
    "main-process/electron-store",
    "renderer-process/windows/main",
    "renderer-process/shared/styles",
    "renderer-process/shared/services",
    "preload",
    "cli",
    "types/config",
  ];

  for (const d of dirs) {
    ensureDir(resolve(dir, d));
  }

  write(
    resolve(dir, "main-process/main.ts"),
    `import { app, BrowserWindow } from "electron";
import { registerWindows, createWindow } from "./core/window";
import { registerAllIpc } from "./ipc";
import { windows } from "./windows";

const bootstrap = () => {
  registerWindows(windows);
  registerAllIpc();
  createWindow("main");
};

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    bootstrap();
  }
});

app.whenReady().then(() => {
  bootstrap();
});
`
  );

  // core/ipc.ts
  write(
    resolve(dir, "main-process/core/ipc.ts"),
    `import { ipcMain, type IpcMainInvokeEvent, type IpcMainEvent } from "electron";

type HandleFn = (event: IpcMainInvokeEvent, ...args: any[]) => any;
type OnFn = (event: IpcMainEvent, ...args: any[]) => void;

export interface IpcRoute {
  type: "handle" | "on";
  channel: string;
  handler: (...args: any[]) => any;
}

export const defineHandlers = <T extends Record<string, HandleFn>>(handlers: T) => {
  const routes: IpcRoute[] = Object.entries(handlers).map(([channel, handler]) => ({
    type: "handle", channel, handler,
  }));
  return { handlers, routes };
};

export const defineListeners = <T extends Record<string, OnFn>>(listeners: T) => {
  const routes: IpcRoute[] = Object.entries(listeners).map(([channel, handler]) => ({
    type: "on", channel, handler,
  }));
  return { listeners, routes };
};

export const registerRoutes = (routes: IpcRoute[]) => {
  for (const route of routes) {
    if (route.type === "handle") ipcMain.handle(route.channel, route.handler);
    else ipcMain.on(route.channel, route.handler);
  }
};
`
  );

  // core/window.ts
  write(
    resolve(dir, "main-process/core/window.ts"),
    `import { BrowserWindow } from "electron";

export type WindowFactory = () => BrowserWindow;

const registry = new Map<string, WindowFactory>();
const instances = new Map<string, BrowserWindow>();

export const registerWindow = (name: string, factory: WindowFactory) => {
  registry.set(name, factory);
};

export const registerWindows = (windows: Record<string, WindowFactory>) => {
  for (const [name, factory] of Object.entries(windows)) {
    registerWindow(name, factory);
  }
};

export const createWindow = (name: string): BrowserWindow => {
  const factory = registry.get(name);
  if (!factory) throw new Error(\`[window] "\${name}" not registered\`);
  const win = factory();
  instances.set(name, win);
  win.on("closed", () => instances.delete(name));
  return win;
};

export const getWindow = (name: string) => instances.get(name);
`
  );

  // windows/main.ts
  write(
    resolve(dir, "main-process/windows/main.ts"),
    `import { BrowserWindow } from "electron";

export const createMainWindow = (): BrowserWindow => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(\`\${process.env.VITE_DEV_SERVER_URL}renderer-process/windows/main/\`);
  }

  return win;
};
`
  );

  // windows/index.ts
  write(
    resolve(dir, "main-process/windows/index.ts"),
    `import { createMainWindow } from "./main";

export const windows = {
  main: createMainWindow,
} as const;
`
  );

  // ipc/index.ts
  write(
    resolve(dir, "main-process/ipc/index.ts"),
    `import { registerRoutes } from "../core/ipc";

export const registerAllIpc = () => {
  // Register your IPC routes here
};
`
  );

  // renderer main page
  write(
    resolve(dir, "renderer-process/windows/main/App.tsx"),
    `const App = () => {
  return (
    <div style={{ padding: 32 }}>
      <h1>⚡ ${projectName}</h1>
      <p>Built with Revolution</p>
    </div>
  );
};

export default App;
`
  );

  write(
    resolve(dir, "renderer-process/windows/main/main.tsx"),
    `import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
`
  );

  write(
    resolve(dir, "renderer-process/windows/main/index.html"),
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
`
  );

  // tsconfig.json
  write(
    resolve(dir, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2020",
        module: "ESNext",
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        skipLibCheck: true,
        baseUrl: ".",
        paths: {
          "@main-process/*": ["main-process/*"],
          "@renderer-process/*": ["renderer-process/*"],
        },
      },
      include: ["main-process", "renderer-process", "preload", "types"],
    }, null, 2)
  );

  console.log(`
  ✓ Project "${projectName}" created!

  Next steps:
    cd ${projectName}
    pnpm install
    pnpm dev
  `);
}

// ---- 帮助 ----

function printHelp() {
  console.log(`
  ⚡ Revolution CLI

  Usage:
    revolution create <name>         Create a new project
    revolution add window <name>     Add a window
    revolution add plugin <name>     Add a plugin
    revolution add ipc <name>        Add an IPC module
    revolution gen:ipc               Generate renderer IPC types

  Examples:
    revolution create my-app
    revolution add window settings
    revolution add plugin file-manager
    revolution add ipc auth
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
    import("./generate-ipc-types.js");
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
