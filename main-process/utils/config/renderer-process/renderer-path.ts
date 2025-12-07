import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @name getRendererPath
 * @description get renderer path
 * @param {string} name
 * @returns {string}
 */
export const getRendererPath = (name: Electron.WindowName) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const path = join(
    __dirname,
    "../",
    "renderer-process",
    "windows",
    name,
    "index.html",
  );
  return path;
};
