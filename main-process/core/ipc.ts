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
 * @description [zh-CN] IPC 调用拦截器（用于 DevTools 等调试工具）
 * @description [zh-TW] IPC 呼叫攔截器（用於 DevTools 等除錯工具）
 * @description [en] IPC call interceptor (for DevTools and debugging tools)
 * @description [ja] IPC 呼び出しインターセプター（DevTools などのデバッグツール用）
 */
export type IpcInterceptor = (channel: string, type: "handle" | "on") => void;

const interceptors: IpcInterceptor[] = [];

/**
 * @description [zh-CN] 添加 IPC 拦截器（每次 IPC 被调用时触发）
 * @description [zh-TW] 新增 IPC 攔截器（每次 IPC 被呼叫時觸發）
 * @description [en] Add IPC interceptor (fires on every IPC call)
 * @description [ja] IPC インターセプターを追加（IPC 呼び出しごとに発火）
 */
export const addIpcInterceptor = (interceptor: IpcInterceptor) => {
  interceptors.push(interceptor);
};

/**
 * @description [zh-CN] 定义 handle 路由（invoke/handle 模式，渲染进程 → 主进程，有返回值）
 * @description [zh-TW] 定義 handle 路由（invoke/handle 模式，渲染程序 → 主程序，有回傳值）
 * @description [en] Define handle routes (invoke/handle pattern, renderer → main, with return value)
 * @description [ja] handle ルートを定義（invoke/handle パターン、レンダラー → メイン、戻り値あり）
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
 * @description [zh-CN] 定义 on 路由（send/on 模式，渲染进程 → 主进程，无返回值）
 * @description [zh-TW] 定義 on 路由（send/on 模式，渲染程序 → 主程序，無回傳值）
 * @description [en] Define on routes (send/on pattern, renderer → main, no return value)
 * @description [ja] on ルートを定義（send/on パターン、レンダラー → メイン、戻り値なし）
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
 * @description [zh-CN] 注册路由到 ipcMain（带拦截器通知）
 * @description [zh-TW] 註冊路由到 ipcMain（帶攔截器通知）
 * @description [en] Register routes to ipcMain (with interceptor notification)
 * @description [ja] ipcMain にルートを登録（インターセプター通知付き）
 */
export const registerRoutes = (routes: IpcRoute[]) => {
  for (const route of routes) {
    if (route.type === "handle") {
      ipcMain.handle(route.channel, (...args) => {
        interceptors.forEach((fn) => fn(route.channel, "handle"));
        return route.handler(...args);
      });
    } else {
      ipcMain.on(route.channel, (...args) => {
        interceptors.forEach((fn) => fn(route.channel, "on"));
        route.handler(...args);
      });
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

/**
 * @description [zh-CN] 定义主进程 → 渲染进程的发送通道（纯类型声明，用于 gen:ipc 生成渲染端类型）
 * @description [zh-TW] 定義主程序 → 渲染程序的發送通道（純型別宣告，用於 gen:ipc 生成渲染端型別）
 * @description [en] Define main → renderer send channels (type declaration only, used by gen:ipc for renderer types)
 * @description [ja] メイン → レンダラーの送信チャンネルを定義（型宣言のみ、gen:ipc がレンダラー型を生成するために使用）
 */
export const defineSenders = <T extends Record<string, (...args: any[]) => void>>(senders: T) => senders;
