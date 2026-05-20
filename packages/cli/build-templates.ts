#!/usr/bin/env node

/**
 * @description [zh-CN] 构建模板 — 将 apps/electron-app 中的模板文件打包为 JSON
 * @description [en] Build templates — bundle template files from apps/electron-app into JSON
 *
 * 运行：npx tsx packages/cli/build-templates.ts
 * 输出：packages/cli/templates.json
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { TEMPLATE_FILES } from "./template-files";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateRoot = resolve(__dirname, "../../apps/electron-app");
const outputPath = resolve(__dirname, "templates.json");

const templates: Record<string, string> = {};

for (const file of TEMPLATE_FILES) {
  const src = resolve(templateRoot, file);
  try {
    templates[file] = readFileSync(src, "utf-8");
  } catch {
    console.warn(`  ⚠ skip (not found): ${file}`);
  }
}

writeFileSync(outputPath, JSON.stringify(templates, null, 2));
console.log(`  ✓ Built ${Object.keys(templates).length} templates → packages/cli/templates.json`);
