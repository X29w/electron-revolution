import { AppModule } from "@main/nest-server-module/app.module";
import { NestFactory } from "@nestjs/core";
import { app, BrowserWindow } from "electron";
import { MainIpc } from "./ipc";
import { WindowModule } from "./windows";
import { WindowManager } from "./windows/window-manager";
import electronLog from "./utils/config/electron-log";

app.whenReady().then(async () => {
  electronLog.info("[App] Starting application...");

  const nestApp = await NestFactory.create(AppModule);
  nestApp.enableCors();
  nestApp.setGlobalPrefix("api");
  await nestApp.listen(3006);

  electronLog.info("[Nest] Server running at http://localhost:3006");

  new MainIpc();
  new WindowModule();

  WindowManager.createWindow("main");
});

app.on("activate", function () {
  if (BrowserWindow.getAllWindows().length === 0)
    WindowManager.createWindow("main");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
