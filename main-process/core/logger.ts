/**
 * @description [zh-CN] 日志模块 — 基于 electron-log，统一日志输出
 * @description [zh-TW] 日誌模組 — 基於 electron-log，統一日誌輸出
 * @description [en] Logger module — based on electron-log, unified log output
 * @description [ja] ログモジュール — electron-log ベース、統一ログ出力
 */

import log from "electron-log";

if (process.env.VITE_DEV_SERVER_URL) {
  log.transports.console.level = "debug";
  log.transports.console.useStyles = true;
  log.transports.console.format = "[{level}] {y-MM-dd HH:mm:ss} {text}";
}

log.transports.file.level = "info";

export const logger = log;
