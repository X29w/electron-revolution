import { is } from "@electron-toolkit/utils";
import { join } from "path";

export const VITE_DEV_SERVER_URL = process.env["ELECTRON_RENDERER_URL"];
export const IS_DEV = is.dev;

export const PRELOAD_PATH = join(__dirname, "../preload/index.js");
