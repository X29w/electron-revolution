/**
 * @description [zh-CN] 插件热加载 — 开发时监听插件目录变化，触发重载回调
 * @description [zh-TW] 插件熱載入 — 開發時監聽插件目錄變化，觸發重載回呼
 * @description [en] Plugin hot-reload — watches plugin directory in dev, triggers reload callback
 * @description [ja] プラグインホットリロード — 開発時にプラグインディレクトリを監視し、リロードコールバックをトリガー
 */

import { watch, type FSWatcher } from "node:fs";
import { resolve, relative } from "node:path";
import { uninstallPlugin, installPlugin, type PluginDef } from "./plugin";
import { logger } from "./logger";
import { IS_DEV } from "../constant";

const watchers = new Map<string, FSWatcher>();

/**
 * @description [zh-CN] 注册插件并启用热加载（仅开发环境）
 * @description [zh-TW] 註冊插件並啟用熱載入（僅開發環境）
 * @description [en] Install plugin with hot-reload watching (dev only)
 * @description [ja] プラグインをインストールしホットリロード監視を有効化（開発環境のみ）
 */
export const installPluginHot = async (
  pluginDir: string,
  def: PluginDef,
  reloadFn: () => PluginDef
): Promise<void> => {
  await installPlugin(def);

  if (!IS_DEV) return;

  const absolutePath = resolve(pluginDir);
  const { name } = def.meta;

  const watcher = watch(absolutePath, { recursive: true }, async (_eventType, filename) => {
    if (!filename?.endsWith(".ts")) return;

    logger.info(`[hot-reload] 🔄 ${name} changed (${filename}), reloading...`);

    try {
      await uninstallPlugin(name);
      const freshDef = reloadFn();
      await installPlugin(freshDef);
      logger.info(`[hot-reload] ✓ ${name} reloaded`);
    } catch (err) {
      logger.error(`[hot-reload] ✗ ${name} reload failed:`, err);
    }
  });

  watchers.set(name, watcher);
  logger.info(`[hot-reload] watching: ${relative(process.cwd(), absolutePath)}`);
};

/**
 * @description [zh-CN] 停止所有热加载监听
 * @description [zh-TW] 停止所有熱載入監聽
 * @description [en] Stop all hot-reload watchers
 * @description [ja] 全ホットリロードウォッチャーを停止
 */
export const stopAllHotReload = () => {
  for (const [name, watcher] of watchers) {
    watcher.close();
    logger.info(`[hot-reload] stopped: ${name}`);
  }
  watchers.clear();
};
