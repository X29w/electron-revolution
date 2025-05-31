declare namespace Electron {
  export type IPCChannelMap = {
    "say-hello": { args: [name: string]; return: string };
    "create-window": { args: [name: string]; return: string };
  };

  export interface CustomWindowConfig<T> extends T {
    loadUrl: string;
    handleEvent?: (win: BrowserWindow) => void;
  }
}
