import { ipcMain } from "electron";

const invokeHandlers: {
  [K in keyof Electron.MainInvokeMap]?: (
    event: Electron.IpcMainInvokeEvent,
    ...args: Electron.MainInvokeMap[K]["args"]
  ) =>
    | Promise<Electron.MainInvokeMap[K]["return"]>
    | Electron.MainInvokeMap[K]["return"];
} = {};

const onHandlers: {
  [K in keyof Electron.MainListenMap]?: (
    event: Electron.IpcMainEvent,
    ...args: Electron.MainListenMap[K]["args"]
  ) => void;
} = {};

export function IPCHandle<K extends keyof Electron.MainInvokeMap>(channel: K) {
  return (
    _target: any,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    invokeHandlers[channel] = descriptor.value;
  };
}

export function IPCOn<K extends keyof Electron.MainListenMap>(channel: K) {
  return (
    _target: any,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    onHandlers[channel] = descriptor.value;
  };
}

/** register all ipc handlers */
export function registerAllIPC() {
  for (const channel in invokeHandlers) {
    ipcMain.handle(
      channel,
      invokeHandlers[channel as keyof typeof invokeHandlers]!
    );
  }

  for (const channel in onHandlers) {
    ipcMain.on(channel, onHandlers[channel as keyof typeof onHandlers]!);
  }
}
