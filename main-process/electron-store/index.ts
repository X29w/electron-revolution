/**
 * @description [zh-CN] Electron Store 实例 — 应用持久化配置
 * @description [zh-TW] Electron Store 實例 — 應用持久化配置
 * @description [en] Electron Store instance — app persistent configuration
 * @description [ja] Electron Store インスタンス — アプリの永続設定
 */

import { IS_DEV, ROOT_PATH } from "../constant";
import { app } from "electron";
import Store, { type Options } from "electron-store";
import { join } from "node:path";

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
  storeConfig.cwd = join(ROOT_PATH, "debug");
}

export const electronStore = new Store<ElectronStore.Options>(storeConfig);
