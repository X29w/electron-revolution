/**
 * @description [zh-CN] 窗口管理模块 — 支持生命周期钩子
 * @description [zh-TW] 視窗管理模組 — 支援生命週期鉤子
 * @description [en] Window management module — with lifecycle hooks
 * @description [ja] ウィンドウ管理モジュール — ライフサイクルフック付き
 */

import { BrowserWindow } from "electron";

export type WindowFactory = () => BrowserWindow;

/**
 * @description [zh-CN] 窗口生命周期钩子
 * @description [zh-TW] 視窗生命週期鉤子
 * @description [en] Window lifecycle hooks
 * @description [ja] ウィンドウライフサイクルフック
 */
export type WindowHook = (name: string, win: BrowserWindow) => void;

const registry = new Map<string, WindowFactory>();
const instances = new Map<string, BrowserWindow>();
const onCreateHooks: WindowHook[] = [];
const onCloseHooks: WindowHook[] = [];

/**
 * @description [zh-CN] 添加窗口创建后钩子（用于统一注入行为）
 * @description [zh-TW] 新增視窗建立後鉤子（用於統一注入行為）
 * @description [en] Add after-create hook (for injecting behavior into all windows)
 * @description [ja] ウィンドウ作成後フックを追加（全ウィンドウに動作を注入）
 */
export const onWindowCreated = (hook: WindowHook) => {
  onCreateHooks.push(hook);
};

/**
 * @description [zh-CN] 添加窗口关闭前钩子
 * @description [zh-TW] 新增視窗關閉前鉤子
 * @description [en] Add before-close hook
 * @description [ja] ウィンドウ閉じる前フックを追加
 */
export const onWindowClosed = (hook: WindowHook) => {
  onCloseHooks.push(hook);
};

export const registerWindow = (name: string, factory: WindowFactory) => {
  if (registry.has(name)) {
    throw new Error(`[window] "${name}" already registered`);
  }
  registry.set(name, factory);
};

export const registerWindows = (windows: Record<string, WindowFactory>) => {
  for (const [name, factory] of Object.entries(windows)) {
    registerWindow(name, factory);
  }
};

export const unregisterWindow = (name: string) => {
  const win = instances.get(name);
  if (win && !win.isDestroyed()) {
    win.close();
  }
  instances.delete(name);
  registry.delete(name);
};

export const createWindow = (name: string): BrowserWindow => {
  const factory = registry.get(name);
  if (!factory) throw new Error(`[window] "${name}" not registered`);

  const win = factory();
  instances.set(name, win);

  // 触发创建钩子
  for (const hook of onCreateHooks) hook(name, win);

  win.on("closed", () => {
    for (const hook of onCloseHooks) hook(name, win);
    instances.delete(name);
  });

  return win;
};

export const getWindow = (name: string): BrowserWindow | undefined => instances.get(name);

export const hasWindow = (name: string): boolean => instances.has(name);

export const getRegisteredWindows = (): string[] => Array.from(registry.keys());

/**
 * @description [zh-CN] 获取所有窗口实例
 * @description [zh-TW] 取得所有視窗實例
 * @description [en] Get all window instances
 * @description [ja] 全ウィンドウインスタンスを取得
 */
export const getAllWindows = (): Map<string, BrowserWindow> => new Map(instances);

export const sendToWindow = (name: string, channel: string, ...args: any[]) => {
  const win = instances.get(name);
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, ...args);
  }
};

/**
 * @description [zh-CN] 向所有窗口广播消息
 * @description [zh-TW] 向所有視窗廣播訊息
 * @description [en] Broadcast message to all windows
 * @description [ja] 全ウィンドウにメッセージをブロードキャスト
 */
export const broadcastToWindows = (channel: string, ...args: any[]) => {
  for (const [, win] of instances) {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, ...args);
    }
  }
};
