import { autoUpdater } from "electron-updater";

export const appUpdateIpcRoutes: Ipc.IpcRoute[] = [
  {
    type: "handle",
    channel: "app-update:check-for-updates",
    handler: () => autoUpdater.checkForUpdates(),
  },
  {
    type: "handle",
    channel: "app-update:download-update",
    handler: () => autoUpdater.downloadUpdate(),
  },
  {
    type: "handle",
    channel: "app-update:quit-and-install",
    handler: () => autoUpdater.quitAndInstall(),
  },
];
