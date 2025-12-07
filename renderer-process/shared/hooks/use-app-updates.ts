import { useEffect, useState } from "react";
import { ipcInvoke, ipcOn } from "../services/ipc";

export const useAppUpdate = () => {
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const available = ipcOn("update:available", () => setStatus("available"));
    const none = ipcOn("update:none", () => setStatus("none"));
    const progress = ipcOn("update:progress", (_, p) => setProgress(p.percent));
    const ready = ipcOn("update:ready", () => setStatus("ready"));

    return () => {
      available();
      none();
      progress();
      ready();
    };
  }, []);

  const check = () => ipcInvoke("app-update:check-for-updates");
  const download = () => ipcInvoke("app-update:download-update");
  const install = () => ipcInvoke("app-update:quit-and-install");

  return { status, progress, check, download, install };
};
