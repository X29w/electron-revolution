const bsdiff = require("bsdiff-node");
const fs = require("fs").promises;

async function createFilePatch(oldFilePath, newFilePath, patchPath) {
  try {
    console.log("Reading files...");

    // 读取旧文件和新文件
    const oldBuffer = await fs.readFile(oldFilePath);
    const newBuffer = await fs.readFile(newFilePath);

    console.log(`Old file size: ${oldBuffer.length} bytes`);
    console.log(`New file size: ${newBuffer.length} bytes`);

    await bsdiff.diff(
      oldFilePath,
      newFilePath,
      patchPath,
      function (result, err) {
        if (err) {
          console.error("Error creating patch:", err.message);
          console.error("Stack:", err.stack);
        } else {
          console.log("Patch created successfully.");
        }
      }
    );
  } catch (error) {
    console.error("Error creating patch:", error.message);
    console.error("Stack:", error.stack);
  }
}

// 调用函数
createFilePatch(
  "F:\\Development\\front-end\\electron\\electron-revolution\\release\\0.0.0\\win-unpacked\\resources\\app.asar",
  "F:\\Development\\front-end\\electron\\electron-revolution\\release\\0.1.0\\win-unpacked\\resources\\app.asar",
  "F:\\Development\\front-end\\electron\\electron-revolution\\release\\app-asar.patch"
);
