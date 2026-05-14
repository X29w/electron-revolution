/**
 * @description [zh-CN] IPC 模块入口 — 集中注册所有 IPC 路由
 * @description [zh-TW] IPC 模組入口 — 集中註冊所有 IPC 路由
 * @description [en] IPC module entry — centralized registration of all IPC routes
 * @description [ja] IPC モジュールエントリ — 全 IPC ルートの一括登録
 */

import { registerRoutes } from "@revolution/core";
import { windowListeners } from "./window";
import { storeHandlers, storeListeners } from "./store";

export const registerAllIpc = () => {
  registerRoutes(windowListeners.routes);
  registerRoutes(storeHandlers.routes);
  registerRoutes(storeListeners.routes);
};
