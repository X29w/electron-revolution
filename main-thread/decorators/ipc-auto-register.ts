import { registerAllIPCHandlers } from "./ipc-handle";

export function AutoRegisterIPC(classes: any[]) {
  return function (_target: any) {
    for (const clazz of classes) {
      new clazz();
    }

    registerAllIPCHandlers();
  };
}
