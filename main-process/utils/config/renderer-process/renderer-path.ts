import { join } from "path";

/**
 * @name getRendererPath
 * @description get renderer path
 * @param {string} name
 * @returns {string}
 */
export const getRendererPath = (name: Electron.WindowName) =>
  join(__dirname, "../", "renderer-process", "window", name, "index.html");
