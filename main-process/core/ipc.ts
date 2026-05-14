/**
 * @description [zh-CN] IPC 核心模块 — 提供类型安全的 IPC 定义和注册，类型从 handler 实现自动推导
 * @description [zh-TW] IPC 核心模組 — 提供型別安全的 IPC 定義和註冊，型別從 handler 實作自動推導
 * @description [en] IPC core module — provides type-safe IPC definition and registration, types auto-inferred from handlers
 * @description [ja] IPC コアモジュール — 型安全な IPC 定義と登録を提供、型は handler 実装から自動推論
 */

import { ipcMain, type IpcMainInvokeEvent, type IpcMainEvent } from "electron";

type HandleFn = (event: IpcMainInvokeEvent, ...args: any[]) => any;
type OnFn = (event: IpcMainEvent, ...args: any[]) => void;

/**
 * @description [zh-CN] 从 handler 函数中提取参数（去掉 event）
 * @description [zh-TW] 從 handler 函數中提取參數（去掉 event）
 * @description [en] Extract args from handler function (excluding event)
 * @description [ja] handler 関数から引数を抽出（event を除く）
 */
export type ExtractArgs<F> = F extends (event: any, ...args: infer A) => any ? A : never;

/**
 * @description [zh-CN] 从 handler 函数中提取返回值类型
 * @description [zh-TW] 從 handler 函數中提取回傳值型別
 * @description [en] Extract return type from handler function
 * @description [ja] handler 関数から戻り値の型を抽出
 */
export type ExtractReturn<F> = F extends (event: any, ...args: any[]) => infer R ? R : never;

/**
 * @description [zh-CN] IPC 路由条目
 * @description [zh-TW] IPC 路由條目
 * @description [en] IPC route entry
 * @description [ja] IPC ルートエントリ
 */
export interface IpcRoute {
  type: "handle" | "on";
  channel: string;
  handler: (...args: any[]) => any;
}

/**
 * @description [zh-CN] 定义 handle 路由（invoke/handle 模式）
 * @description [zh-TW] 定義 handle 路由（invoke/handle 模式）
 * @description [en] Define handle routes (invoke/handle pattern)
 * @description [ja] handle ルートを定義（invoke/handle パターン）
 */
export const defineHandlers = <T extends Record<string, HandleFn>>(handlers: T) => {
  const routes: IpcRoute[] = Object.entries(handlers).map(([channel, handler]) => ({
    type: "handle",
    channel,
    handler,
  }));
  return { handlers, routes };
};

/**
 * @description [zh-CN] 定义 on 路由（send/on 模式）
 * @description [zh-TW] 定義 on 路由（send/on 模式）
 * @description [en] Define on routes (send/on pattern)
 * @description [ja] on ルートを定義（send/on パターン）
 */
export const defineListeners = <T extends Record<string, OnFn>>(listeners: T) => {
  const routes: IpcRoute[] = Object.entries(listeners).map(([channel, handler]) => ({
    type: "on",
    channel,
    handler,
  }));
  return { listeners, routes };
};

/**
 * @description [zh-CN] 注册路由到 ipcMain
 * @description [zh-TW] 註冊路由到 ipcMain
 * @description [en] Register routes to ipcMain
 * @description [ja] ipcMain にルートを登録
 */
export const registerRoutes = (routes: IpcRoute[]) => {
  for (const route of routes) {
    if (route.type === "handle") {
      ipcMain.handle(route.channel, route.handler);
    } else {
      ipcMain.on(route.channel, route.handler);
    }
  }
};

/**
 * @description [zh-CN] 注销路由
 * @description [zh-TW] 註銷路由
 * @description [en] Unregister routes
 * @description [ja] ルートを登録解除
 */
export const unregisterRoutes = (routes: IpcRoute[]) => {
  for (const route of routes) {
    if (route.type === "handle") {
      ipcMain.removeHandler(route.channel);
    } else {
      ipcMain.removeAllListeners(route.channel);
    }
  }
};
