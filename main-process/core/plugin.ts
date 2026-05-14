/**
 * @description [zh-CN] 插件系统 — 插件 = 一个函数，接收 context，返回清理函数（可选）
 * @description [zh-TW] 插件系統 — 插件 = 一個函數，接收 context，回傳清理函數（可選）
 * @description [en] Plugin system — plugin = a function that receives context and optionally returns a cleanup function
 * @description [ja] プラグインシステム — プラグイン = context を受け取り、オプションでクリーンアップ関数を返す関数
 */

import type { IpcRoute } from "./ipc";
import { registerRoutes, unregisterRoutes } from "./ipc";
import { registerWindow, unregisterWindow, type WindowFactory } from "./window";
import { EventBus } from "./event-bus";
import { logger } from "./logger";

/**
 * @description [zh-CN] 插件元信息
 * @description [zh-TW] 插件元資訊
 * @description [en] Plugin metadata
 * @description [ja] プラグインメタ情報
 */
export interface PluginMeta {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
}

export type PluginState = "active" | "inactive" | "error";

/**
 * @description [zh-CN] 插件上下文 — 插件通过此对象与宿主交互
 * @description [zh-TW] 插件上下文 — 插件透過此物件與宿主互動
 * @description [en] Plugin context — plugins interact with the host through this object
 * @description [ja] プラグインコンテキスト — プラグインはこのオブジェクトを通じてホストと対話
 */
export interface PluginContext {
  ipc(routes: IpcRoute[]): void;
  window(name: string, factory: WindowFactory): void;
  command(id: string, handler: () => void | Promise<void>): void;
  on(event: string, handler: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  use<T = any>(pluginName: string): T | undefined;
  log: {
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };
}

export type PluginSetup = (ctx: PluginContext) => void | (() => void) | Promise<void | (() => void)>;

export interface PluginDef {
  meta: PluginMeta;
  setup: PluginSetup;
  api?: Record<string, any>;
}

interface PluginRuntime {
  def: PluginDef;
  state: PluginState;
  cleanup?: () => void;
  ipcRoutes: IpcRoute[];
  windows: string[];
  commands: string[];
}

const plugins = new Map<string, PluginRuntime>();
const apis = new Map<string, any>();

/**
 * @description [zh-CN] 定义一个插件（纯声明，不执行）
 * @description [zh-TW] 定義一個插件（純宣告，不執行）
 * @description [en] Define a plugin (declaration only, not executed)
 * @description [ja] プラグインを定義（宣言のみ、実行しない）
 */
export const definePlugin = (def: PluginDef): PluginDef => def;

/**
 * @description [zh-CN] 安装并激活插件
 * @description [zh-TW] 安裝並啟動插件
 * @description [en] Install and activate a plugin
 * @description [ja] プラグインをインストールして有効化
 */
export const installPlugin = async (def: PluginDef): Promise<void> => {
  const { name } = def.meta;

  if (plugins.has(name)) {
    logger.warn(`[plugin] "${name}" already installed`);
    return;
  }

  if (def.meta.dependencies) {
    for (const dep of def.meta.dependencies) {
      const depRuntime = plugins.get(dep);
      if (!depRuntime || depRuntime.state !== "active") {
        throw new Error(`[plugin] "${name}" requires "${dep}" to be active`);
      }
    }
  }

  const runtime: PluginRuntime = {
    def,
    state: "inactive",
    ipcRoutes: [],
    windows: [],
    commands: [],
  };

  const ctx: PluginContext = {
    ipc: (routes) => {
      registerRoutes(routes);
      runtime.ipcRoutes.push(...routes);
    },
    window: (windowName, factory) => {
      registerWindow(windowName, factory);
      runtime.windows.push(windowName);
    },
    command: (id, handler) => {
      EventBus.on(`command:${id}`, handler);
      runtime.commands.push(id);
    },
    on: (event, handler) => {
      EventBus.on(event, handler);
    },
    emit: (event, ...args) => {
      EventBus.emit(event, ...args);
    },
    use: <T>(pluginName: string): T | undefined => {
      return apis.get(pluginName) as T | undefined;
    },
    log: {
      info: (...args) => logger.info(`[${name}]`, ...args),
      warn: (...args) => logger.warn(`[${name}]`, ...args),
      error: (...args) => logger.error(`[${name}]`, ...args),
    },
  };

  plugins.set(name, runtime);

  try {
    const cleanup = await def.setup(ctx);
    if (typeof cleanup === "function") {
      runtime.cleanup = cleanup;
    }

    if (def.api) {
      apis.set(name, def.api);
    }

    runtime.state = "active";
    EventBus.emit("plugin:activated", name);
    logger.info(`[plugin] ✓ ${name}@${def.meta.version}`);
  } catch (err) {
    runtime.state = "error";
    logger.error(`[plugin] ✗ ${name} failed:`, err);
    throw err;
  }
};

/**
 * @description [zh-CN] 卸载插件
 * @description [zh-TW] 卸載插件
 * @description [en] Uninstall a plugin
 * @description [ja] プラグインをアンインストール
 */
export const uninstallPlugin = async (name: string): Promise<void> => {
  const runtime = plugins.get(name);
  if (!runtime) return;

  if (runtime.cleanup) runtime.cleanup();

  unregisterRoutes(runtime.ipcRoutes);

  for (const win of runtime.windows) unregisterWindow(win);
  for (const cmd of runtime.commands) EventBus.off(`command:${cmd}`);

  apis.delete(name);
  plugins.delete(name);
  EventBus.emit("plugin:deactivated", name);
  logger.info(`[plugin] uninstalled: ${name}`);
};

/**
 * @description [zh-CN] 获取插件状态
 * @description [zh-TW] 取得插件狀態
 * @description [en] Get plugin state
 * @description [ja] プラグインの状態を取得
 */
export const getPluginState = (name: string): PluginState | undefined => plugins.get(name)?.state;

/**
 * @description [zh-CN] 获取所有已安装插件
 * @description [zh-TW] 取得所有已安裝插件
 * @description [en] Get all installed plugins
 * @description [ja] インストール済みの全プラグインを取得
 */
export const getInstalledPlugins = (): { name: string; version: string; state: PluginState }[] =>
  Array.from(plugins.entries()).map(([name, rt]) => ({
    name,
    version: rt.def.meta.version,
    state: rt.state,
  }));

/**
 * @description [zh-CN] 执行命令
 * @description [zh-TW] 執行命令
 * @description [en] Execute a command
 * @description [ja] コマンドを実行
 */
export const executeCommand = (id: string) => {
  EventBus.emit(`command:${id}`);
};
