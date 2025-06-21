import { join } from "path";

/**
 * @name getRendererPath
 * @description get renderer path
 * @param {string} name
 * @returns {string}
 */
export const getRendererPath = (name: string) =>
  join(
    __dirname,
    "../",
    "renderer",
    "render-thread",
    "windows",
    name,
    "index.html"
  );
