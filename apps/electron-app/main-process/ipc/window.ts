/**
 * @description [zh-CN] IPC: 窗口管理 — 打开、关闭、最小化、最大化
 * @description [zh-TW] IPC: 視窗管理 — 開啟、關閉、最小化、最大化
 * @description [en] IPC: Window management — open, close, minimize, maximize
 * @description [ja] IPC: ウィンドウ管理 — 開く、閉じる、最小化、最大化
 */

import { defineListeners } from "@x-elevolution/core";
import { createWindow, getWindow } from "@x-elevolution/core";

export const windowListeners = defineListeners({
  "window:open": (_, name: string) => {
    const win = getWindow(name);
    win ? win.show() : createWindow(name);
  },
  "window:close": (_, name: string) => {
    getWindow(name)?.close();
  },
  "window:minimize": (_, name: string) => {
    getWindow(name)?.minimize();
  },
  "window:maximize": (_, name: string) => {
    getWindow(name)?.maximize();
  },
  "window:unMaximize": (_, name: string) => {
    getWindow(name)?.unmaximize();
  },
});
