/**
 * @description [zh-CN] DevTools 调试窗口工厂函数
 * @description [zh-TW] DevTools 除錯視窗工廠函數
 * @description [en] DevTools debug window factory function
 * @description [ja] DevTools デバッグウィンドウファクトリ関数
 */

import { BrowserWindow } from "electron";
import { IS_DEV, PRELOAD_PATH, VITE_DEV_SERVER_URL } from "../constant";
import { getRendererPath } from "../utils/renderer-path";

export const createDevtoolsWindow = (): BrowserWindow => {
  const win = new BrowserWindow({
    width: 900,
    height: 650,
    title: "Elevolution DevTools",
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
    },
  });

  if (IS_DEV) {
    win.loadURL(`${VITE_DEV_SERVER_URL}renderer-process/windows/devtools/`);
  } else {
    win.loadFile(getRendererPath("devtools"));
  }

  return win;
};
