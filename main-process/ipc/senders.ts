/**
 * @description [zh-CN] 主进程 → 渲染进程的发送通道定义（用于类型生成）
 * @description [zh-TW] 主程序 → 渲染程序的發送通道定義（用於型別生成）
 * @description [en] Main → renderer send channel definitions (for type generation)
 * @description [ja] メイン → レンダラーの送信チャンネル定義（型生成用）
 */

import { defineSenders } from "../core/ipc";

/**
 * @description [zh-CN] 通过 webContents.send 发送到渲染进程的通道
 * @description [zh-TW] 透過 webContents.send 發送到渲染程序的通道
 * @description [en] Channels sent to renderer via webContents.send
 * @description [ja] webContents.send 経由でレンダラーに送信するチャンネル
 *
 * 使用方式：sendToWindow("main", "store:changed", newValue)
 * 渲染进程：ipcOn("store:changed", (_, value) => { ... })
 */
export const senders = defineSenders({
  "store:changed": (_value: ElectronStore.Options) => {},
});
