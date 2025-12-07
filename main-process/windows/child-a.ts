import {
  IS_DEV,
  PRELOAD_PATH,
  VITE_DEV_SERVER_URL,
} from "@main-process/constant/config";
import { RegisterWindow } from "@main-process/utils/config/decorator/window-register";
import { getRendererPath } from "@main-process/utils/config/renderer-process/renderer-path";
import { BrowserWindow } from "electron";
import { IWindow } from "../utils/config/main-process/window-manager";

@RegisterWindow("child-a")
export class ChildAWindow implements IWindow {
  create() {
    const win = new BrowserWindow({
      width: 1280,
      height: 800,
      webPreferences: {
        preload: PRELOAD_PATH,
        contextIsolation: true,
      },
    });

    if (IS_DEV)
      win.loadURL(`${VITE_DEV_SERVER_URL}renderer-process/windows/child-a/`);
    else win.loadFile(getRendererPath("child-a"));

    return win;
  }
}
