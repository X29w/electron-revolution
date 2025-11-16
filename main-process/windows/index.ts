import { AutoRegisterWindows } from "@main-process/utils/config/decorator/window-auto-register";
import { MainWindow } from "./window-instance/main";

/** window module */
@AutoRegisterWindows([MainWindow])
export class WindowModule {}
