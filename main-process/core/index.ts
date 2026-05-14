/**
 * @description [zh-CN] Revolution Core — 插件化 Electron 框架核心导出
 * @description [zh-TW] Revolution Core — 插件化 Electron 框架核心匯出
 * @description [en] Revolution Core — pluggable Electron framework core exports
 * @description [ja] Revolution Core — プラグイン化 Electron フレームワークのコアエクスポート
 */

export {
  defineHandlers,
  defineListeners,
  defineSenders,
  registerRoutes,
  unregisterRoutes,
  addIpcInterceptor,
  type IpcRoute,
  type IpcInterceptor,
  type ExtractArgs,
  type ExtractReturn,
} from "./ipc";

export {
  registerWindow,
  registerWindows,
  unregisterWindow,
  createWindow,
  getWindow,
  hasWindow,
  sendToWindow,
  type WindowFactory,
} from "./window";

export {
  definePlugin,
  installPlugin,
  uninstallPlugin,
  getPluginState,
  getInstalledPlugins,
  executeCommand,
  type PluginDef,
  type PluginMeta,
  type PluginContext,
  type PluginSetup,
} from "./plugin";

export { EventBus } from "./event-bus";
export { logger } from "./logger";
export { installPluginHot, stopAllHotReload } from "./hot-reload";
