/**
 * @description [zh-CN] 应用常量配置 — 路径、环境变量
 * @description [zh-TW] 應用常量配置 — 路徑、環境變數
 * @description [en] App constants — paths, environment variables
 * @description [ja] アプリ定数 — パス、環境変数
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const ROOT_PATH = join(__dirname, "..");

export const PRELOAD_PATH = join(ROOT_PATH, "preload", "index.mjs");

export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

export const IS_DEV = !!VITE_DEV_SERVER_URL;
