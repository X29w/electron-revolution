import { logger } from "@main-process/utils/config/electron-logger";
import { BrowserWindow, globalShortcut } from "electron";

export const registerGlobalShortcut = () => {
  // 打开开发者工具
  globalShortcut.register("CommandOrControl+Shift+I", () => {
    BrowserWindow.getFocusedWindow()?.webContents.openDevTools();
  });

  logger.info("Global shortcut registered successfully");
};
