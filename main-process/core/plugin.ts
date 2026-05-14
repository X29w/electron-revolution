/**
 * @description [zh-CN] 插件系统 — 支持 context 扩展和自定义 logger
 * @description [zh-TW] 插件系統 — 支援 context 擴展和自訂 logger
 * @description [en] Plugin system — supports context extension and custom logger
 * @description [ja] プラグインシステム — コンテキスト拡張とカスタムロガーをサポート
 */

import type { IpcRoute } from "./ipc";
import { registerRoutes, unregisterRoutes } from "./ipc";
import { registerWindow, unregisterWindow, type WindowFactory } from "./window";
import { EventBus } from "./event-bus";
import { logger } from "./logger";

export interface PluginMeta {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
}

export type PluginState = "active" | "inactive" | "error";

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
  /** @description [zh-CN] 扩展字段，用户可通过 extendPluginContext 注入 */
  [key: string]: any;
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
 * @description [zh-CN] Context 扩展器列表 — 用户可注入自定义字段到所有插件的 ctx
 * @description [zh-TW] Context 擴展器列表 — 使用者可注入自訂欄位到所有插件的 ctx
 * @description [en] Context extenders — inject custom fields into all plugin contexts
 * @description [ja] コンテキスト拡張 — 全プラグインの ctx にカスタムフィールドを注入
 */
type ContextExtender = (ctx: PluginContext, meta: PluginMeta) => void;
const contextExtenders: ContextExtender[] = [];

/**
 * @description [zh-CN] 扩展插件 context（所有后续安装的插件都会获得扩展字段）
 * @description [zh-TW] 擴展插件 context（所有後續安裝的插件都會獲得擴展欄位）
 * @description [en] Extend plugin context (all subsequently installed plugins will receive the extension)
 * @description [ja] プラグインコンテキストを拡張（以降インストールされる全プラグインが拡張を受け取る）
 *
 * @example
 * ```ts
 * extendPluginContext((ctx, meta) => {
 *   ctx.store = electronStore;
 *   ctx.dialog = dialog;
 * });
 * ```
 */
export const extendPluginContext = (extender: ContextExtender) => {
  contextExtenders.push(extender);
};

export const definePlugin = (def: PluginDef): PluginDef => def;

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

  // 应用所有 context 扩展
  for (const extender of contextExtenders) extender(ctx, def.meta);

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

export const getPluginState = (name: string): PluginState | undefined => plugins.get(name)?.state;

export const getInstalledPlugins = (): { name: string; version: string; state: PluginState }[] =>
  Array.from(plugins.entries()).map(([name, rt]) => ({
    name,
    version: rt.def.meta.version,
    state: rt.state,
  }));

export const executeCommand = (id: string) => {
  EventBus.emit(`command:${id}`);
};
