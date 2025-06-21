import { ipcRenderer, contextBridge } from "electron";

const api: Electron.Preload = {
  "invoke-example": () => ipcRenderer.invoke("invoke-example"),
  "say-hello": () => ipcRenderer.send("say-hello"),
  "create-window": (name) => ipcRenderer.send("create-window", name),
  "messages-from-main-thread": (cb) =>
    ipcRenderer.on("messages-from-main-thread", (_e, arg) => cb(arg)),
};

contextBridge.exposeInMainWorld("electronAPI", api);
