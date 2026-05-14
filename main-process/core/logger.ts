/**
 * @description [zh-CN] 日志模块 — 默认使用 electron-log，支持替换
 * @description [zh-TW] 日誌模組 — 預設使用 electron-log，支援替換
 * @description [en] Logger module — defaults to electron-log, replaceable
 * @description [ja] ログモジュール — デフォルトは electron-log、置換可能
 */

import log from "electron-log";

export interface Logger {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  [key: string]: any;
}

let currentLogger: Logger = log;

/**
 * @description [zh-CN] 获取当前 logger 实例
 * @description [zh-TW] 取得當前 logger 實例
 * @description [en] Get current logger instance
 * @description [ja] 現在の logger インスタンスを取得
 */
export const logger: Logger = new Proxy({} as Logger, {
  get: (_, prop: string) => {
    return (currentLogger as any)[prop];
  },
});

/**
 * @description [zh-CN] 替换 logger 实现（如 pino、winston 等）
 * @description [zh-TW] 替換 logger 實作（如 pino、winston 等）
 * @description [en] Replace logger implementation (e.g. pino, winston)
 * @description [ja] logger 実装を置換（例: pino、winston）
 */
export const setLogger = (newLogger: Logger) => {
  currentLogger = newLogger;
};
