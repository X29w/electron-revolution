import { ROOT_PATH } from "@main-process/constant/config";
import log from "electron-log";
import { join } from "node:path";

// 配置日志
function configureLogger() {
  // 设置开发环境下的日志目录
  if (process.env.NODE_ENV === "development") {
    // 配置日志文件路径
    log.transports.file.resolvePathFn = () => {
      return join(ROOT_PATH, "debug", "app.log");
    };
  }

  // 设置日志级别
  log.transports.file.level = "info";
  log.transports.console.level = "info";

  // 在开发环境下启用控制台输出
  if (process.env.NODE_ENV === "development") {
    log.transports.console.level = "debug";
    // 启用控制台颜色
    log.transports.console.useStyles = true;
    // 自定义格式，包含颜色
    log.transports.console.format = "[{level}] {y-MM-dd HH:mm:ss} {text}";
  }

  return log;
}

export const logger = configureLogger();
