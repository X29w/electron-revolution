/**
 * @description [zh-CN] DevTools 插件 — 可视化调试面板
 * @description [en] DevTools plugin — visual debug panel
 */

import { definePlugin, defineHandlers, useIpcMiddleware, getInstalledPlugins, getRegisteredWindows, EventBus } from "@x-industry/elevolution-core";

interface IpcLogEntry {
  timestamp: number;
  direction: "handle" | "on" | "event";
  channel: string;
  duration?: number;
}

const ipcLog: IpcLogEntry[] = [];
const MAX_LOG_SIZE = 500;

const addLog = (entry: IpcLogEntry) => {
  ipcLog.push(entry);
  if (ipcLog.length > MAX_LOG_SIZE) ipcLog.shift();
};

const handlers = defineHandlers({
  "devtools:getPlugins": () => getInstalledPlugins(),
  "devtools:getWindows": () => getRegisteredWindows(),
  "devtools:getIpcLog": () => [...ipcLog],
  "devtools:clearIpcLog": () => { ipcLog.length = 0; return true; },
  "devtools:getStats": () => ({
    plugins: getInstalledPlugins().length,
    windows: getRegisteredWindows().length,
    ipcLogSize: ipcLog.length,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  }),
  "devtools:getStore": () => {
    try {
      const Store = require("electron-store");
      const store = new Store({ name: "app-config" });
      return store.store;
    } catch { return null; }
  },
});

export const devtoolsPlugin = definePlugin({
  meta: {
    name: "devtools",
    version: "1.0.0",
    description: "Built-in visual debug panel for Elevolution",
  },

  api: { getIpcLog: () => [...ipcLog] },

  setup(ctx) {
    ctx.ipc(handlers.routes);

    // 中间件：记录 IPC 调用耗时
    useIpcMiddleware((channel, type, _args, next) => {
      if (channel.startsWith("devtools:")) return next();
      const start = performance.now();
      const result = next();
      const duration = performance.now() - start;
      addLog({ timestamp: Date.now(), direction: type, channel, duration });
      return result;
    });

    // 记录 EventBus 事件
    const originalEmit = EventBus.emit;
    EventBus.emit = (event: string, ...args: any[]) => {
      if (!event.startsWith("devtools:") && !event.startsWith("command:")) {
        addLog({ timestamp: Date.now(), direction: "event", channel: event });
      }
      originalEmit(event, ...args);
    };

    ctx.log.info("DevTools ready → ipcSend('window:open', 'devtools')");

    return () => { EventBus.emit = originalEmit; };
  },
});
