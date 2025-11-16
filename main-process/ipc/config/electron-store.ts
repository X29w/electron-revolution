import { electronStore } from "@main-process/electron-store";

export const electronStoreIpcRoutes: Ipc.IpcRoute[] = [
  {
    type: "handle",
    channel: "store:getAll",
    handler: () => electronStore.store,
  },
  {
    type: "handle",
    channel: "store:get",
    handler: (_, key) => electronStore.get(key),
  },
  {
    type: "on",
    channel: "store:set",
    handler: (_, key, value) => electronStore.set(key, value),
  },
];
