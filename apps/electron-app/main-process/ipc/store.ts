/**
 * @description [zh-CN] IPC: 持久化存储 — 基于 electron-store 的配置读写
 * @description [zh-TW] IPC: 持久化儲存 — 基於 electron-store 的配置讀寫
 * @description [en] IPC: Persistent storage — config read/write based on electron-store
 * @description [ja] IPC: 永続ストレージ — electron-store ベースの設定読み書き
 */

import { defineHandlers, defineListeners } from "@x-industry/elevolution-core";
import { electronStore } from "../electron-store";

export const storeHandlers = defineHandlers({
  "store:getAll": () => electronStore.store,
  "store:get": (_, key: keyof ElectronStore.Options) => electronStore.get(key),
});

export const storeListeners = defineListeners({
  "store:set": (
    _,
    key: keyof ElectronStore.Options,
    value: ElectronStore.Options[keyof ElectronStore.Options]
  ) => {
    electronStore.set(key, value);
  },
});
