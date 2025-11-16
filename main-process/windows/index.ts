import { AutoRegisterWindows } from "@main-process/utils/config/decorator/window-auto-register";
import { MainWindow } from "./window-instance/main";
import { ChildAWindow } from "./window-instance/child-a";

/** window module */
@AutoRegisterWindows([MainWindow, ChildAWindow])
export class WindowModule {}
