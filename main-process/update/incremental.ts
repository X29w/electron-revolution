import { app } from "electron";
import bsdiff from "bsdiff-node";
import fs from "fs";
import path from "path";
import axios from "axios";
import { logger } from "@main-process/utils/config/electron-logger";
const { patch } = bsdiff;

export async function tryIncrementalUpdate() {
  const PATCH_BASE = "http://localhost:3000/static/electron";
  logger.info("[Updater] 开始尝试增量更新...");

  const currentVersion = app.getVersion();
  logger.info("[Updater] 当前版本:", currentVersion);

  try {
    // ① 读取补丁信息
    const patchJsonUrl = `${PATCH_BASE}/patch-${currentVersion}-to-0.1.0.json`;
    logger.info("[Updater] 请求补丁信息 URL:", patchJsonUrl);

    const patchInfoResponse = await axios.get(patchJsonUrl);
    const patchInfo = patchInfoResponse.data;
    logger.info("[Updater] 成功获取补丁信息:", JSON.stringify(patchInfo));

    // 补丁路径
    const patchUrl = `${PATCH_BASE}/${patchInfo.patch}`;
    const patchPath = path.join(app.getPath("temp"), patchInfo.patch);
    logger.info("[Updater] 补丁下载地址:", patchUrl);
    logger.info("[Updater] 补丁本地存储路径:", patchPath);

    // ② 下载补丁
    logger.info("[Updater] 开始下载补丁文件...");
    const bin = await axios.get(patchUrl, { responseType: "arraybuffer" });
    logger.info(
      "[Updater] 补丁文件下载完成，大小:",
      bin.data.byteLength,
      "字节",
    );

    fs.writeFileSync(patchPath, Buffer.from(bin.data));
    logger.info("[Updater] 补丁文件已保存至本地");

    // ③ 应用补丁
    const appAsar = path.join(process.resourcesPath, "app.asar");
    const patched = appAsar + ".patched";
    logger.info("[Updater] 原始 app.asar 路径:", appAsar);
    logger.info("[Updater] 补丁后文件临时路径:", patched);

    logger.info("[Updater] 开始应用补丁...");
    await patch(appAsar, patched, patchPath, (result: number) => {
      logger.info("[Updater] 补丁应用进度:" + String(result).padStart(4) + "%");
    });
    logger.info("[Updater] 补丁应用完成");

    // 检查补丁后文件是否存在
    if (!fs.existsSync(patched)) {
      logger.error("[Updater] 补丁应用后文件未生成");
      return false;
    }
    logger.info("[Updater] 验证补丁后文件存在");

    // 覆盖 app.asar
    logger.info("[Updater] 开始覆盖原始 app.asar 文件");
    fs.renameSync(patched, appAsar);
    logger.info("[Updater] app.asar 文件覆盖完成");

    logger.info("[Updater] 补丁应用成功！准备重启应用");
    app.relaunch();
    app.exit();

    return true;
  } catch (err) {
    logger.error("[Updater] 增量更新失败:", err);
    return false;
  }
}
