/**
 * @description [zh-CN] DevTools 插件 — 可视化调试面板，显示 IPC 通信、插件状态、窗口状态
 * @description [zh-TW] DevTools 插件 — 可視化除錯面板，顯示 IPC 通訊、插件狀態、視窗狀態
 * @description [en] DevTools plugin — visual debug panel showing IPC traffic, plugin state, window state
 * @description [ja] DevTools プラグイン — IPC 通信、プラグイン状態、ウィンドウ状態を表示するビジュアルデバッグパネル
 */

import { definePlugin, defineHandlers } from "../../core";
import { getInstalledPlugins } from "../../core/plugin";
import { getRegisteredWindows } from "../../core/window";
import { EventBus } from "../../core/event-bus";

interface IpcLogEntry {
  timestamp: number;
  direction: "invoke" | "send" | "emit";
  channel: string;
}

const ipcLog: IpcLogEntry[] = [];
const MAX_LOG_SIZE = 500;

const addLog = (entry: IpcLogEntry) => {
  ipcLog.push(entry);
  if (ipcLog.length > MAX_LOG_SIZE) {
    ipcLog.shift();
  }
};

const handlers = defineHandlers({
  "devtools:getPlugins": () => getInstalledPlugins(),
  "devtools:getWindows": () => getRegisteredWindows(),
  "devtools:getIpcLog": () => [...ipcLog],
  "devtools:clearIpcLog": () => {
    ipcLog.length = 0;
    return true;
  },
  "devtools:getStats": () => ({
    plugins: getInstalledPlugins().length,
    windows: getRegisteredWindows().length,
    ipcLogSize: ipcLog.length,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  }),
});

export const devtoolsPlugin = definePlugin({
  meta: {
    name: "devtools",
    version: "1.0.0",
    description: "Built-in visual debug panel for Revolution",
  },

  api: {
    getIpcLog: () => [...ipcLog],
    addLog,
  },

  setup(ctx) {
    ctx.ipc(handlers.routes);

    const originalEmit = EventBus.emit;

    EventBus.emit = (event: string, ...args: any[]) => {
      if (!event.startsWith("devtools:")) {
        addLog({ timestamp: Date.now(), direction: "emit", channel: event });
      }
      originalEmit(event, ...args);
    };

    ctx.log.info("DevTools panel ready");

    return () => {
      EventBus.emit = originalEmit;
    };
  },
});
