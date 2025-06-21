import {
  IS_DEV,
  PRELOAD_PATH,
  VITE_DEV_SERVER_URL,
} from "@main/constant/config";
import { RegisterWindow } from "@main/decorators/window-register";
import { getRendererPath } from "@main/utils/config/renderer-path";
import { BrowserWindow } from "electron";
import { IWindow } from "../window-manager";

@RegisterWindow("main")
export class MainWindow implements IWindow {
  create() {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: PRELOAD_PATH,
        contextIsolation: true,
      },
    });

    if (IS_DEV)
      win.loadURL(`${VITE_DEV_SERVER_URL}/render-process/windows/main/`);
    else win.loadFile(getRendererPath("main"));

    return win;
  }
}
