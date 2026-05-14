/**
 * @description [zh-CN] 插件热加载 — 开发时监听插件目录变化，触发重载
 * @description [zh-TW] 插件熱載入 — 開發時監聽插件目錄變化，觸發重載
 * @description [en] Plugin hot-reload — watches plugin directory in dev, triggers reload
 * @description [ja] プラグインホットリロード — 開発時にプラグインディレクトリを監視し、リロードをトリガー
 */

import { watch, type FSWatcher } from "node:fs";
import { resolve, relative } from "node:path";
import { uninstallPlugin, installPlugin, type PluginDef } from "./plugin";
import { logger } from "./logger";

const watchers = new Map<string, FSWatcher>();

/**
 * @description [zh-CN] 注册插件并启用热加载
 * @description [zh-TW] 註冊插件並啟用熱載入
 * @description [en] Install plugin with hot-reload watching
 * @description [ja] プラグインをインストールしホットリロード監視を有効化
 *
 * @param pluginDir - 插件目录路径
 * @param def - 插件定义
 * @param reloadFn - 重载时调用的函数，返回新的 PluginDef
 * @param enabled - 是否启用热加载（传入 IS_DEV 等环境判断）
 */
export const installPluginHot = async (
  pluginDir: string,
  def: PluginDef,
  reloadFn: () => PluginDef,
  enabled = true
): Promise<void> => {
  await installPlugin(def);

  if (!enabled) return;

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
