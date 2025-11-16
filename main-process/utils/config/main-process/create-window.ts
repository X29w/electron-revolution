import { WindowModule } from "@main-process/windows";
import { WindowManager } from "@main-process/windows/window-manager";

export const createWindow = () => {
  new WindowModule();
  WindowManager.createWindow("main");
};
