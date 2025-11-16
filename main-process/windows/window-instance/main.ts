import {
  IS_DEV,
  PRELOAD_PATH,
  VITE_DEV_SERVER_URL,
} from "@main-process/constant/config";
import { RegisterWindow } from "@main-process/utils/config/decorator/window-register";
import { exitApp } from "@main-process/utils/config/main-process/exit-app";
import { getRendererPath } from "@main-process/utils/config/renderer-process/renderer-path";
import { BrowserWindow } from "electron";
import { IWindow } from "../window-manager";

@RegisterWindow("main")
export class MainWindow implements IWindow {
  create() {
    const win = new BrowserWindow({
      width: 1280,
      height: 800,
      webPreferences: {
        preload: PRELOAD_PATH,
        contextIsolation: true,
      },
    });

    // 窗口关闭时程序退出
    win.on("closed", () => exitApp());

    if (IS_DEV)
      win.loadURL(`${VITE_DEV_SERVER_URL}renderer-process/window/main/`);
    else win.loadFile(getRendererPath("main"));

    return win;
  }
}
