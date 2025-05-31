import { IPCHandle } from "@main/decorators/ipc-handle";
import { WindowManager } from "@main/windows/window-manager";
import { type IpcMainInvokeEvent } from "electron";

export class WindowIPC {
  @IPCHandle("create-window")
  createWindow(_e: IpcMainInvokeEvent, name: string) {
    if (!WindowManager.hasWindow(name)) {
      WindowManager.createWindow(name);
    }
  }
}
