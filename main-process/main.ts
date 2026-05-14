/**
 * @description [zh-CN] 应用入口 — 注册窗口、IPC、快捷键，启动主窗口
 * @description [zh-TW] 應用入口 — 註冊視窗、IPC、快捷鍵，啟動主視窗
 * @description [en] App entry — register windows, IPC, shortcuts, and launch main window
 * @description [ja] アプリエントリ — ウィンドウ、IPC、ショートカットを登録し、メインウィンドウを起動
 */

import { app, BrowserWindow } from "electron";
import { registerWindows, createWindow, installPlugin } from "./core";
import { registerAllIpc } from "./ipc";
import { registerGlobalShortcut } from "./global-short-cut";
import { windows } from "./windows";
import { devtoolsPlugin } from "./plugins/devtools";
import { IS_DEV } from "./constant";

const bootstrap = async () => {
  registerWindows(windows);
  registerAllIpc();

  if (IS_DEV) {
    await installPlugin(devtoolsPlugin);
  }

  createWindow("main");
};

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    bootstrap();
  }
});

app.whenReady().then(() => {
  registerGlobalShortcut();
  bootstrap();
});
