import { WindowManager } from "./window-manager";

export const windowSend = <K extends keyof Ipc.Send>(
  windowName: Electron.WindowName,
  channel: K,
  ...args: Ipc.Send[K]["args"]
) => {
  const win = WindowManager.getWindow(windowName);
  if (!win) return;
  win.webContents.send(channel, ...args);
};
