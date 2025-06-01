import { ipcRenderer, contextBridge } from "electron";

const api: ElectronAPI = {
  "say-hello": (name: string) => ipcRenderer.invoke("say-hello", name),
  "create-window": (name: Electron.WindowName) =>
    ipcRenderer.invoke("create-window", name),
};

contextBridge.exposeInMainWorld("electronAPI", api);
