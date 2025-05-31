type ElectronAPI = {
  [K in keyof Electron.IPCChannelMap]: (
    ...args: Electron.IPCChannelMap[K]["args"]
  ) => Promise<Electron.IPCChannelMap[K]["return"]>;
};

// Used in Renderer process, expose in `preload.ts`
interface Window {
  electronAPI: ElectronAPI;
}
