import path from "path";
import fs from "fs";
import { app } from "electron";
import { execSync } from "child_process";
import electronLog from "./electron-log";

export const ensureProdDbIfPackaged = () => {
  if (!app.isPackaged) return;

  const dbPath = path.join(
    app.getAppPath(),
    "../..",
    "resources/database/prod.db"
  );
  if (!fs.existsSync(dbPath)) {
    electronLog.info(
      "[DB] prod.db not found. Running prisma migrate deploy..."
    );
    try {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      electronLog.info("[DB] Migration completed.");
    } catch (err) {
      electronLog.error("[DB] Migration failed:", err);
    }
  }
};
