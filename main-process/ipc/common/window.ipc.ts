import { WindowManager } from "@main-process/windows/window-manager";

export const windowIpcRoutes: Ipc.IpcRoute[] = [
  {
    type: "on",
    channel: "window:open",
    handler: (_, name) => {
      const window = WindowManager.getWindow(name);
      window ? window.show() : WindowManager.createWindow(name);
    },
  },
  {
    type: "on",
    channel: "window:close",
    handler: (_, name) => WindowManager.getWindow(name)?.close(),
  },
  {
    type: "on",
    channel: "window:minimize",
    handler: (_, name) => WindowManager.getWindow(name)?.minimize(),
  },
  {
    type: "on",
    channel: "window:maximize",
    handler: (_, name) => WindowManager.getWindow(name)?.maximize(),
  },
  {
    type: "on",
    channel: "window:unMaximize",
    handler: (_, name) => WindowManager.getWindow(name)?.unmaximize(),
  },
];
