import { ipcRenderer, contextBridge } from "electron";

const api: Electron.Preload = {
  "invoke-example": () => ipcRenderer.invoke("invoke-example"),
  "say-hello": () => ipcRenderer.send("say-hello"),
  "create-window": (name) => ipcRenderer.send("create-window", name),
  "messages-from-main-process": (cb) =>
    ipcRenderer.on("messages-from-main-process", (_e, arg) => cb(arg)),
  "enable-main-send-message": () =>
    ipcRenderer.send("enable-main-send-message"),
};

contextBridge.exposeInMainWorld("electronAPI", api);
