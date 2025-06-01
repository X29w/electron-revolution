import { type IpcMainInvokeEvent } from "electron";
import { IPCHandle } from "../decorators/ipc-handle";

/** hello ipc */
export class HelloIPC {
  @IPCHandle("say-hello")
  handleHello(_event: IpcMainInvokeEvent, name: string) {
    return `Hello, ${name}!`;
  }
}
