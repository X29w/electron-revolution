/**
 * @description [zh-CN] 日志模块 — 默认使用 console，用户可替换为任意实现
 * @description [zh-TW] 日誌模組 — 預設使用 console，使用者可替換為任意實作
 * @description [en] Logger module — defaults to console, user can replace with any implementation
 * @description [ja] ログモジュール — デフォルトは console、任意の実装に置換可能
 */

export interface Logger {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  [key: string]: any;
}

const defaultLogger: Logger = {
  info: (...args) => console.log("[revolution]", ...args),
  warn: (...args) => console.warn("[revolution]", ...args),
  error: (...args) => console.error("[revolution]", ...args),
  debug: (...args) => console.debug("[revolution]", ...args),
};

let currentLogger: Logger = defaultLogger;

/**
 * @description [zh-CN] 获取当前 logger（内部使用）
 * @description [zh-TW] 取得當前 logger（內部使用）
 * @description [en] Get current logger (internal use)
 * @description [ja] 現在の logger を取得（内部使用）
 */
export const logger: Logger = new Proxy({} as Logger, {
  get: (_, prop: string) => (currentLogger as any)[prop],
});

/**
 * @description [zh-CN] 替换 logger 实现（如 electron-log、pino、winston）
 * @description [zh-TW] 替換 logger 實作（如 electron-log、pino、winston）
 * @description [en] Replace logger implementation (e.g. electron-log, pino, winston)
 * @description [ja] logger 実装を置換（例: electron-log、pino、winston）
 *
 * @example
 * ```ts
 * import log from "electron-log";
 * import { setLogger } from "@revolution/core";
 * setLogger(log);
 * ```
 */
export const setLogger = (newLogger: Logger) => {
  currentLogger = newLogger;
};
