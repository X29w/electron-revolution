/**
 * @description [zh-CN] IPC 核心模块 — 提供类型安全的 IPC 定义和注册，支持中间件和拦截器
 * @description [zh-TW] IPC 核心模組 — 提供型別安全的 IPC 定義和註冊，支援中介軟體和攔截器
 * @description [en] IPC core module — type-safe IPC definition and registration with middleware and interceptors
 * @description [ja] IPC コアモジュール — ミドルウェアとインターセプター付きの型安全な IPC 定義と登録
 */

import { ipcMain, type IpcMainInvokeEvent, type IpcMainEvent } from "electron";

type HandleFn = (event: IpcMainInvokeEvent, ...args: any[]) => any;
type OnFn = (event: IpcMainEvent, ...args: any[]) => void;

export type ExtractArgs<F> = F extends (event: any, ...args: infer A) => any ? A : never;
export type ExtractReturn<F> = F extends (event: any, ...args: any[]) => infer R ? R : never;

export interface IpcRoute {
  type: "handle" | "on";
  channel: string;
  handler: (...args: any[]) => any;
}

/**
 * @description [zh-CN] IPC 中间件 — 可以拦截、修改、或终止 IPC 调用
 * @description [zh-TW] IPC 中介軟體 — 可以攔截、修改、或終止 IPC 呼叫
 * @description [en] IPC middleware — can intercept, modify, or abort IPC calls
 * @description [ja] IPC ミドルウェア — IPC 呼び出しを傍受、変更、または中止可能
 */
export type IpcMiddleware = (
  channel: string,
  type: "handle" | "on",
  args: any[],
  next: () => any
) => any;

/**
 * @description [zh-CN] IPC 拦截器（轻量观察者，不能修改调用）
 * @description [zh-TW] IPC 攔截器（輕量觀察者，不能修改呼叫）
 * @description [en] IPC interceptor (lightweight observer, cannot modify calls)
 * @description [ja] IPC インターセプター（軽量オブザーバー、呼び出しを変更不可）
 */
export type IpcInterceptor = (channel: string, type: "handle" | "on") => void;

const middlewares: IpcMiddleware[] = [];
const interceptors = new Set<IpcInterceptor>();

/**
 * @description [zh-CN] 添加 IPC 中间件（可拦截/修改调用，按添加顺序执行）
 * @description [zh-TW] 新增 IPC 中介軟體（可攔截/修改呼叫，按新增順序執行）
 * @description [en] Add IPC middleware (can intercept/modify calls, executed in order)
 * @description [ja] IPC ミドルウェアを追加（呼び出しを傍受/変更可能、追加順に実行）
 */
export const useIpcMiddleware = (middleware: IpcMiddleware) => {
  middlewares.push(middleware);
};

/**
 * @description [zh-CN] 添加 IPC 拦截器（观察用，返回移除函数）
 * @description [zh-TW] 新增 IPC 攔截器（觀察用，回傳移除函數）
 * @description [en] Add IPC interceptor (observation only, returns remove function)
 * @description [ja] IPC インターセプターを追加（観察用、削除関数を返す）
 */
export const addIpcInterceptor = (interceptor: IpcInterceptor): (() => void) => {
  interceptors.add(interceptor);
  return () => interceptors.delete(interceptor);
};

/**
 * @description [zh-CN] 执行中间件链
 * @description [zh-TW] 執行中介軟體鏈
 * @description [en] Execute middleware chain
 * @description [ja] ミドルウェアチェーンを実行
 */
const runMiddlewares = (channel: string, type: "handle" | "on", args: any[], handler: () => any) => {
  let index = 0;
  const next = (): any => {
    if (index < middlewares.length) {
      return middlewares[index++](channel, type, args, next);
    }
    return handler();
  };
  return next();
};

export const defineHandlers = <T extends Record<string, HandleFn>>(handlers: T) => {
  const routes: IpcRoute[] = Object.entries(handlers).map(([channel, handler]) => ({
    type: "handle",
    channel,
    handler,
  }));
  return { handlers, routes };
};

export const defineListeners = <T extends Record<string, OnFn>>(listeners: T) => {
  const routes: IpcRoute[] = Object.entries(listeners).map(([channel, handler]) => ({
    type: "on",
    channel,
    handler,
  }));
  return { listeners, routes };
};

export const defineSenders = <T extends Record<string, (...args: any[]) => void>>(senders: T) => senders;

export const registerRoutes = (routes: IpcRoute[]) => {
  for (const route of routes) {
    if (route.type === "handle") {
      ipcMain.handle(route.channel, (...args) => {
        for (const fn of interceptors) fn(route.channel, "handle");
        return runMiddlewares(route.channel, "handle", args, () => route.handler(...args));
      });
    } else {
      ipcMain.on(route.channel, (...args) => {
        for (const fn of interceptors) fn(route.channel, "on");
        runMiddlewares(route.channel, "on", args, () => route.handler(...args));
      });
    }
  }
};

export const unregisterRoutes = (routes: IpcRoute[]) => {
  for (const route of routes) {
    if (route.type === "handle") {
      ipcMain.removeHandler(route.channel);
    } else {
      ipcMain.removeAllListeners(route.channel);
    }
  }
};
