import { ipcRenderer, contextBridge } from "electron";
const api = {
  "say-hello": (name: string) => ipcRenderer.invoke("say-hello", name),
  "create-window": (name: string) => ipcRenderer.invoke("create-window", name),
};
contextBridge.exposeInMainWorld("electronAPI", api);
