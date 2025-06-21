import { is } from "@electron-toolkit/utils";
import { join } from "path";

/** vite dev server url */
export const VITE_DEV_SERVER_URL = process.env["ELECTRON_RENDERER_URL"];

/** is dev */
export const IS_DEV = is.dev;

/** preload path */
export const PRELOAD_PATH = join(__dirname, "../preload/index.js");
