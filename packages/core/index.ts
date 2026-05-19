/**
 * @description [zh-CN] X-Elevolution Core — 插件化 Electron 框架核心导出
 * @description [zh-TW] X-Elevolution Core — 插件化 Electron 框架核心匯出
 * @description [en] X-Elevolution Core — pluggable Electron framework core exports
 * @description [ja] X-Elevolution Core — プラグイン化 Electron フレームワークのコアエクスポート
 */

export {
  defineHandlers,
  defineListeners,
  defineSenders,
  registerRoutes,
  unregisterRoutes,
  useIpcMiddleware,
  addIpcInterceptor,
  type IpcRoute,
  type IpcMiddleware,
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
  getRegisteredWindows,
  getAllWindows,
  sendToWindow,
  broadcastToWindows,
  onWindowCreated,
  onWindowClosed,
  type WindowFactory,
  type WindowHook,
} from "./window";

export {
  definePlugin,
  installPlugin,
  uninstallPlugin,
  extendPluginContext,
  pluginRef,
  getPluginState,
  getInstalledPlugins,
  executeCommand,
  type PluginDef,
  type PluginMeta,
  type PluginContext,
  type PluginSetup,
} from "./plugin";

export { EventBus } from "./event-bus";
export { logger, setLogger, type Logger } from "./logger";
export { installPluginHot, stopAllHotReload } from "./hot-reload";
