import { ipcMain, IpcMainInvokeEvent } from "electron";

type IPCChannelMap = Electron.IPCChannelMap;

type HandlerMap = {
  [K in keyof IPCChannelMap]?: (
    event: IpcMainInvokeEvent,
    ...args: IPCChannelMap[K]["args"]
  ) => Promise<IPCChannelMap[K]["return"]> | IPCChannelMap[K]["return"];
};

const handlers: HandlerMap = {};

export function IPCHandle<K extends keyof IPCChannelMap>(channel: K) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    handlers[channel] = descriptor.value;
  };
}

export function registerAllIPCHandlers() {
  for (const key in handlers) {
    ipcMain.handle(key, handlers[key as keyof typeof handlers]!);
  }
}
