import "reflect-metadata";
import { app, BrowserWindow } from "electron";
import { registerGlobalShortcut } from "./global-short-cut";
import { IpcModule } from "./ipc";
import { exitApp } from "./utils/config/main-process/exit-app";
import { WindowModule } from "./windows";
import { WindowManager } from "./utils/config/main-process/window-manager";

const createWindow = () => {
  new WindowModule();
  WindowManager.createWindow("main");
};

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
