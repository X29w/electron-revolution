/**
 * @description [zh-CN] 窗口注册 — 所有窗口在这里集中导出
 * @description [zh-TW] 視窗註冊 — 所有視窗在這裡集中匯出
 * @description [en] Window registry — all windows are exported here
 * @description [ja] ウィンドウ登録 — 全ウィンドウをここで一括エクスポート
 */

import { createMainWindow } from "./main";
import { createChildAWindow } from "./child-a";
import { createDevtoolsWindow } from "./devtools";

export const windows = {
  main: createMainWindow,
  "child-a": createChildAWindow,
  devtools: createDevtoolsWindow,
} as const;

export type WindowName = keyof typeof windows;
