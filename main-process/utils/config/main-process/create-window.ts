import { WindowModule } from "@main-process/windows";
import { WindowManager } from "@main-process/utils/config/main-process/window-manager";

export const createWindow = () => {
  new WindowModule();
  WindowManager.createWindow("main");
};
