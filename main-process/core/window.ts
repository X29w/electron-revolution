/**
 * @description [zh-CN] 窗口管理模块 — 纯函数式窗口注册和管理
 * @description [zh-TW] 視窗管理模組 — 純函數式視窗註冊和管理
 * @description [en] Window management module — purely functional window registration and management
 * @description [ja] ウィンドウ管理モジュール — 純粋関数型のウィンドウ登録と管理
 */

import { BrowserWindow } from "electron";

/**
 * @description [zh-CN] 窗口工厂函数类型
 * @description [zh-TW] 視窗工廠函數型別
 * @description [en] Window factory function type
 * @description [ja] ウィンドウファクトリ関数の型
 */
export type WindowFactory = () => BrowserWindow;

const registry = new Map<string, WindowFactory>();
const instances = new Map<string, BrowserWindow>();

/**
 * @description [zh-CN] 注册窗口
 * @description [zh-TW] 註冊視窗
 * @description [en] Register a window
 * @description [ja] ウィンドウを登録
 */
export const registerWindow = (name: string, factory: WindowFactory) => {
  if (registry.has(name)) {
    throw new Error(`[window] "${name}" already registered`);
  }
  registry.set(name, factory);
};

/**
 * @description [zh-CN] 批量注册窗口
 * @description [zh-TW] 批量註冊視窗
 * @description [en] Register multiple windows
 * @description [ja] ウィンドウを一括登録
 */
export const registerWindows = (windows: Record<string, WindowFactory>) => {
  for (const [name, factory] of Object.entries(windows)) {
    registerWindow(name, factory);
  }
};

/**
 * @description [zh-CN] 注销窗口
 * @description [zh-TW] 註銷視窗
 * @description [en] Unregister a window
 * @description [ja] ウィンドウを登録解除
 */
export const unregisterWindow = (name: string) => {
  const win = instances.get(name);
  if (win && !win.isDestroyed()) {
    win.close();
  }
  instances.delete(name);
  registry.delete(name);
};

/**
 * @description [zh-CN] 创建窗口
 * @description [zh-TW] 建立視窗
 * @description [en] Create a window
 * @description [ja] ウィンドウを作成
 */
export const createWindow = (name: string): BrowserWindow => {
  const factory = registry.get(name);
  if (!factory) throw new Error(`[window] "${name}" not registered`);

  const win = factory();
  instances.set(name, win);

  win.on("closed", () => {
    instances.delete(name);
  });

  return win;
};

/**
 * @description [zh-CN] 获取窗口实例
 * @description [zh-TW] 取得視窗實例
 * @description [en] Get window instance
 * @description [ja] ウィンドウインスタンスを取得
 */
export const getWindow = (name: string): BrowserWindow | undefined => instances.get(name);

/**
 * @description [zh-CN] 窗口是否存在
 * @description [zh-TW] 視窗是否存在
 * @description [en] Check if window exists
 * @description [ja] ウィンドウが存在するか確認
 */
export const hasWindow = (name: string): boolean => instances.has(name);

/**
 * @description [zh-CN] 获取所有已注册窗口名
 * @description [zh-TW] 取得所有已註冊視窗名稱
 * @description [en] Get all registered window names
 * @description [ja] 登録済みの全ウィンドウ名を取得
 */
export const getRegisteredWindows = (): string[] => Array.from(registry.keys());

/**
 * @description [zh-CN] 向窗口发送消息
 * @description [zh-TW] 向視窗發送訊息
 * @description [en] Send message to a window
 * @description [ja] ウィンドウにメッセージを送信
 */
export const sendToWindow = (name: string, channel: string, ...args: any[]) => {
  const win = instances.get(name);
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, ...args);
  }
};
