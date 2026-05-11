/** handle (invoke) */
export const ipcInvoke = async <K extends keyof Ipc.Handle>(
  channel: K,
  ...args: Ipc.Handle[K]["args"]
): Promise<Ipc.Handle[K]["return"]> => {
  return window.ipcRenderer.invoke(channel, ...args);
};

/** send */
export const ipcSend = <K extends keyof Ipc.On>(
  channel: K,
  ...args: Ipc.On[K]["args"]
) => {
  window.ipcRenderer.send(channel, ...args);
};

/** on (监听主进程 send) */
export const ipcOn = <K extends keyof Ipc.Send>(
  channel: K,
  listener: (
    event: Electron.IpcRendererEvent,
    ...args: Ipc.Send[K]["args"]
  ) => void
) => {
  window.ipcRenderer.on(channel, listener);
  return () => window.ipcRenderer.removeListener(channel, listener);
};
