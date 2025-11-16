import { IpcAutoRegister } from "@main-process/utils/config/decorator/ipc-auto-register";
import { windowIpcRoutes } from "./common/window.ipc";
import { electronStoreIpcRoutes } from "./config/electron-store";

@IpcAutoRegister([...windowIpcRoutes, ...electronStoreIpcRoutes])
export class IpcModule {}
