import { app, BrowserWindow } from "electron";
import { createWindow } from "./create-window";
import { registerGlobalShortcut } from "@main-process/global-short-cut";
import { IpcModule } from "@main-process/ipc";
import { exitApp } from "./exit-app";

export const registerAppEventEmitter = () => {
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      exitApp();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.whenReady().then(async () => {
    registerGlobalShortcut(); // 注册全局快捷键
    new IpcModule(); // 注册IPC通信模块
    createWindow();
  });
};
