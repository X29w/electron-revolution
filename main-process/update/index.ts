import { autoUpdater } from "electron-updater";
import { windowSend } from "@main-process/utils/config/main-process/window-send";
import { tryIncrementalUpdate } from "./incremental";
import { logger } from "@main-process/utils/config/electron-logger";

export const initAutoUpdater = async () => {
  autoUpdater.autoDownload = false;

  const isIncrementalSuccess = await tryIncrementalUpdate();
  if (isIncrementalSuccess) return;
  logger.info("No incremental update found, start auto update");
  autoUpdater.checkForUpdates();

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
