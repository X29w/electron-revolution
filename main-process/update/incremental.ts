import { app } from "electron";
import bsdiff from "bsdiff-node";
import fs from "fs";
import path from "path";
import axios from "axios";
import { logger } from "@main-process/utils/config/electron-logger";
const { patch } = bsdiff;

export async function tryIncrementalUpdate() {
  const PATCH_BASE = "http://localhost:3000/static/electron";

  const currentVersion = app.getVersion();

  try {
    // ① 读取补丁信息
    const patchJsonUrl = `${PATCH_BASE}/patch-${currentVersion}-to-0.1.0.json`;
    const patchInfo = (await axios.get(patchJsonUrl)).data;

    logger.info("[Updater] 找到增量补丁:", patchInfo);

    // 补丁路径
    const patchUrl = `${PATCH_BASE}/${patchInfo.patch}`;
    const patchPath = path.join(app.getPath("temp"), patchInfo.patch);

    // ② 下载补丁
    const bin = await axios.get(patchUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(patchPath, Buffer.from(bin.data));

    // ③ 应用补丁
    const appAsar = path.join(process.resourcesPath, "app.asar");
    const patched = appAsar + ".patched";

    console.log("[Updater] 开始应用补丁...");
    await patch(appAsar, patched, patchPath, (result: number) => {
      console.log("patch:" + String(result).padStart(4) + "%");
    });

    // 覆盖 app.asar
    fs.renameSync(patched, appAsar);

    console.log("[Updater] 补丁应用成功！开始重启");
    app.relaunch();
    app.exit();

    return true;
  } catch (err) {
    console.error("[Updater] 增量更新失败:", err);
    return false;
  }
}
