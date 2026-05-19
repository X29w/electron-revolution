/**
 * @description [zh-CN] 全局快捷键注册
 * @description [zh-TW] 全域快捷鍵註冊
 * @description [en] Global shortcut registration
 * @description [ja] グローバルショートカット登録
 */

import { BrowserWindow, globalShortcut } from "electron";
import { logger } from "@x-elevolution/core";

export const registerGlobalShortcut = () => {
  globalShortcut.register("CommandOrControl+Shift+I", () => {
    BrowserWindow.getFocusedWindow()?.webContents.openDevTools();
  });

  logger.info("[shortcut] registered");
};
