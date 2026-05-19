/**
 * @description [zh-CN] 主窗口工厂函数
 * @description [zh-TW] 主視窗工廠函數
 * @description [en] Main window factory function
 * @description [ja] メインウィンドウファクトリ関数
 */

import { BrowserWindow } from "electron";
import { IS_DEV, PRELOAD_PATH, VITE_DEV_SERVER_URL } from "../constant";
import { getRendererPath } from "../utils/renderer-path";

export const createMainWindow = (): BrowserWindow => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
    },
    frame: false
  });

  if (IS_DEV) {
    win.loadURL(`${VITE_DEV_SERVER_URL}renderer-process/windows/main/`);
  } else {
    win.loadFile(getRendererPath("main"));
  }

  return win;
};
