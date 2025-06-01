import { ipcMain, IpcMainInvokeEvent } from "electron";

/** ipc channel map */
type IPCChannelMap = Electron.IPCChannelMap;

/** handler map */
type HandlerMap = {
  [K in keyof IPCChannelMap]?: (
    event: IpcMainInvokeEvent,
    ...args: IPCChannelMap[K]["args"]
  ) => Promise<IPCChannelMap[K]["return"]> | IPCChannelMap[K]["return"];
};

/** handlers */
const handlers: HandlerMap = {};

/** ipc handle decorator */
export function IPCHandle<K extends keyof IPCChannelMap>(channel: K) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    handlers[channel] = descriptor.value;
  };
}

/** register all ipc handlers */
export function registerAllIPCHandlers() {
  for (const key in handlers) {
    ipcMain.handle(key, handlers[key as keyof typeof handlers]!);
  }
}
