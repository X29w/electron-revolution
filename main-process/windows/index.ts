import { AutoRegisterWindows } from "@main-process/utils/config/decorator/window-auto-register";
import { MainWindow } from "./main";
import { ChildAWindow } from "./child-a";

/** window module */
@AutoRegisterWindows([MainWindow, ChildAWindow])
export class WindowModule {}
