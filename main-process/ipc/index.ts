import { AutoRegisterIPC } from "../decorators/ipc-auto-register";
import { HelloIPC } from "./hello.ipc";
import { WindowIPC } from "./window.ipc";

/** main ipc */
@AutoRegisterIPC([HelloIPC, WindowIPC])
export class MainIpc {}
