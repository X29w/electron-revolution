import path from "path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_PATH = path.join(__dirname, "..");

export const MAIN_PROCESS_PATH = path.join(ROOT_PATH, "main-process");

export const PRELOAD_PATH = path.join(ROOT_PATH, "preload", "index.mjs");
