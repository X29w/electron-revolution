import {
  IS_DEV,
  PRELOAD_PATH,
  VITE_DEV_SERVER_URL,
} from "@main-process/constant/config";
import { app, BrowserWindow } from "electron";
import { IWindow } from "../window-manager";
import { RegisterWindow } from "@main-process/utils/config/decorator/window-register";
import { getRendererPath } from "@main-process/utils/config/renderer/renderer-path";

@RegisterWindow("main")
export class MainWindow implements IWindow {
  create() {
    const win = new BrowserWindow({
      width: 1280,
      height: 800,
      autoHideMenuBar: true,
      frame: false,
      webPreferences: {
        preload: PRELOAD_PATH,
        contextIsolation: true,
      },
    });

    // 窗口关闭时程序退出
    win.on("closed", () => app.quit());

    if (IS_DEV)
      win.loadURL(`${VITE_DEV_SERVER_URL}renderer-process/window/main/`);
    else win.loadFile(getRendererPath("main"));

    return win;
  }
}
