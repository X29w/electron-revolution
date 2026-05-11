import { ipcMain } from "electron";

export const IpcAutoRegister = (routes: Ipc.IpcRoute[]) => {
  return (_: Function) => {
    routes.forEach((r) => {
      if (r.type === "handle") {
        ipcMain.handle(r.channel, r.handler);
      } else if (r.type === "on") {
        ipcMain.on(r.channel, r.handler);
      }
    });
    console.log("ipc auto register success");
  };
};
