import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const ROOT_PATH = join(__dirname, "..");

export const MAIN_PROCESS_PATH = join(ROOT_PATH, "main-process");

export const PRELOAD_PATH = join(ROOT_PATH, "preload", "index.mjs");

export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

export const IS_DEV = !!process.env.VITE_DEV_SERVER_URL;
