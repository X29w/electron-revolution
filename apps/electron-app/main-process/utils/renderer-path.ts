/**
 * @description [zh-CN] 获取渲染进程 HTML 文件路径（生产环境用）
 * @description [zh-TW] 取得渲染程序 HTML 檔案路徑（生產環境用）
 * @description [en] Get renderer process HTML file path (for production)
 * @description [ja] レンダラープロセスの HTML ファイルパスを取得（本番環境用）
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const getRendererPath = (name: string): string => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return join(__dirname, "../renderer-process/windows", name, "index.html");
};
