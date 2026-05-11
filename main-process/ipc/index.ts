import { IpcAutoRegister } from "@main-process/utils/config/decorator/ipc-auto-register";
import { windowIpcRoutes } from "./common/window.ipc";
import { electronStoreIpcRoutes } from "./config/electron-store";
import { appUpdateIpcRoutes } from "./config/app-update";

@IpcAutoRegister([
  ...windowIpcRoutes,
  ...electronStoreIpcRoutes,
  ...appUpdateIpcRoutes,
])
export class IpcModule {}
