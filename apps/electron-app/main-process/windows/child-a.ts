/**
 * @description [zh-CN] 子窗口 A 工厂函数
 * @description [zh-TW] 子視窗 A 工廠函數
 * @description [en] Child window A factory function
 * @description [ja] 子ウィンドウ A ファクトリ関数
 */

import { BrowserWindow } from "electron";
import { IS_DEV, PRELOAD_PATH, VITE_DEV_SERVER_URL } from "../constant";
import { getRendererPath } from "../utils/renderer-path";

export const createChildAWindow = (): BrowserWindow => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame:false,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
    },
  });

  if (IS_DEV) {
    win.loadURL(`${VITE_DEV_SERVER_URL}renderer-process/windows/child-a/`);
  } else {
    win.loadFile(getRendererPath("child-a"));
  }

  return win;
};
