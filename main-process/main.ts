import "reflect-metadata";
import { app, BrowserWindow } from "electron";
import Koa from "koa";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DataSource } from "typeorm";
import { ExampleEntity } from "./entities/Example.entity";
import Router from "@koa/router";


const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

const AppDataSource = new DataSource({
  type: "sqlite",
  database: "./dev.db",
  entities: [ExampleEntity],
  synchronize: true,
});

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

async function startKoa() {
  await AppDataSource.initialize();

  const app = new Koa();
  const router = new Router();

  router.get("/api/examples", async (ctx) => {
    const repo = AppDataSource.getRepository(ExampleEntity);
    const data = await repo.find();
    ctx.body = data;
  });

  app.use(router.routes()).use(router.allowedMethods());

  app.listen(3006, () => {
    console.log("Koa server running on http://localhost:3006");
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  await startKoa();
  createWindow();
});
