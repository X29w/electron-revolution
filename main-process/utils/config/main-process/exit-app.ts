import { app } from "electron";

export const exitApp = () => {
  app.quit();
  process.exit(0);
};
