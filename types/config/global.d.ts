// Used in Renderer process, expose in `preload.ts`
interface Window {
  electronAPI: Electron.Preload;
}
