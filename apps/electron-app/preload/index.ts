/**
 * @description [zh-CN] 预加载脚本 — 向渲染进程暴露安全的 IPC API
 * @description [zh-TW] 預載入腳本 — 向渲染程序暴露安全的 IPC API
 * @description [en] Preload script — exposes safe IPC API to renderer process
 * @description [ja] プリロードスクリプト — レンダラープロセスに安全な IPC API を公開
 */

import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
});
