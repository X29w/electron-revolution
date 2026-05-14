/**
 * @description [zh-CN] DevTools 插件 — 可视化调试面板，记录所有 IPC 调用
 * @description [zh-TW] DevTools 插件 — 可視化除錯面板，記錄所有 IPC 呼叫
 * @description [en] DevTools plugin — visual debug panel, records all IPC calls
 * @description [ja] DevTools プラグイン — ビジュアルデバッグパネル、全 IPC 呼び出しを記録
 */

import { definePlugin, defineHandlers, addIpcInterceptor, getInstalledPlugins, getRegisteredWindows } from "@revolution/core";

interface IpcLogEntry {
  timestamp: number;
  direction: "handle" | "on";
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

  api: { getIpcLog: () => [...ipcLog] },

  setup(ctx) {
    ctx.ipc(handlers.routes);

    // 拦截所有 IPC 调用（包括插件注册的）
    addIpcInterceptor((channel, type) => {
      if (!channel.startsWith("devtools:")) {
        addLog({ timestamp: Date.now(), direction: type, channel });
      }
    });

    ctx.log.info("DevTools ready → ipcSend('window:open', 'devtools')");
  },
});
