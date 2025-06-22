import Logger from "electron-log";

const electronLog = Logger;

electronLog.transports.file.fileName = "electron.log";

electronLog.transports.console.format = "{y}-{m}-{d} {h}:{i}:{s}:{ms} {text}";

electronLog.transports.file.maxSize = 5 * 1024 * 1024;

export default electronLog;
