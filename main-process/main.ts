import { app, BrowserWindow } from "electron";
import "reflect-metadata";
import { registerGlobalShortcut } from "./global-short-cut";
import { IpcModule } from "./ipc";
import { startKoa } from "./koa-server/app";
import { WindowModule } from "./windows";
import { WindowManager } from "./windows/window-manager";

function createWindow() {
  new WindowModule();
  WindowManager.createWindow("main");
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  await startKoa();
  registerGlobalShortcut(); // 注册全局快捷键
  new IpcModule(); // 注册IPC通信模块
  createWindow();
});
