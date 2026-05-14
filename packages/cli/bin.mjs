#!/usr/bin/env node

/**
 * @description [zh-CN] CLI 入口 shim — 通过 tsx 执行 TypeScript CLI
 * @description [zh-TW] CLI 入口 shim — 透過 tsx 執行 TypeScript CLI
 * @description [en] CLI entry shim — executes TypeScript CLI via tsx
 * @description [ja] CLI エントリ shim — tsx 経由で TypeScript CLI を実行
 */

import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliPath = resolve(__dirname, "index.ts");
const args = process.argv.slice(2).join(" ");

try {
  execSync(`npx tsx "${cliPath}" ${args}`, { stdio: "inherit", cwd: process.cwd() });
} catch {
  process.exit(1);
}
