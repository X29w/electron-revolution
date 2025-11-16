import { IS_DEV, ROOT_PATH } from "@main-process/constant/config";
import { app } from "electron";
import Store, { Options } from "electron-store";
import path from "path";

const storeConfig: Options<ElectronStore.Options> = {
  name: "app-config",
  defaults: {
    common: {
      device: {
        localIp: "",
        deviceName: "",
      },
    },
    feature: {
      screenshotPath: app.getPath("pictures"),
      enableAccess: false,
    },
  },
};

if (IS_DEV) {
  // 如果是开发环境，将配置文件存储在项目的 debug 文件夹中
  storeConfig.cwd = path.join(ROOT_PATH, "debug");
}

export const electronStore = new Store<ElectronStore.Options>(storeConfig);
