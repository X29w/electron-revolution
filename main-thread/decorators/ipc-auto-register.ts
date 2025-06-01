import { registerAllIPCHandlers } from "./ipc-handle";

/** auto register ipc handlers */
export function AutoRegisterIPC(classes: any[]) {
  return function (_target: any) {
    for (const clazz of classes) {
      new clazz();
    }

    registerAllIPCHandlers();
  };
}
