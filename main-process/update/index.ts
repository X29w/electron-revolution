import { autoUpdater } from "electron-updater";
import { windowSend } from "@main-process/utils/config/main-process/window-send";

export const initAutoUpdater = () => {
  autoUpdater.autoDownload = false;

  autoUpdater.on("update-available", () => {
    windowSend("main", "update:available");
  });

  autoUpdater.on("update-not-available", () => {
    windowSend("main", "update:none");
  });

  autoUpdater.on("download-progress", (progress) => {
    windowSend("main", "update:progress", progress);
  });

  autoUpdater.on("update-downloaded", () => {
    windowSend("main", "update:ready");
  });
};
