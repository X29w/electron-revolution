declare namespace Electron {
  /** main process invoke map */
  export interface MainInvokeMap {
    "invoke-example": {
      args: [];
      return: string;
    };
  }

  /** main process send map */
  export interface MainListenMap {
    "say-hello": {
      args: [name: string];
    };
    "create-window": {
      args: [name: string];
    };
    "on-example-event": {
      args: [msg: string];
    };
    "enable-main-send-message": {
      args: [];
    };
  }

  /** renderer process invoke map */
  export interface RendererInvokeMap {
    "invoke-example": {
      args: [];
      return: string;
    };
  }

  /** renderer process send map */
  export interface RendererSendMap {
    "say-hello": {};
    "create-window": {
      args: [name: string];
    };
    "enable-main-send-message": {
      args: [];
    };
  }

  /** renderer process on map */
  export interface RendererOnMap {
    "messages-from-main-process": {
      args: [msg: string];
    };
  }

  /** invoke preload */
  export type InvokePreload = {
    [K in keyof Electron.RendererInvokeMap]: (
      ...args: Electron.RendererInvokeMap[K]["args"]
    ) => Promise<Electron.RendererInvokeMap[K]["return"]>;
  };

  /** send preload */
  export type SendPreload = {
    [K in keyof Electron.RendererSendMap]: (
      ...args: Electron.RendererSendMap[K]["args"]
    ) => void;
  };

  /** on preload */
  export type OnPreload = {
    [K in keyof Electron.RendererOnMap]: (
      cb: (...args: Electron.RendererOnMap[K]["args"]) => void
    ) => void;
  };

  /** preload */
  export type Preload = InvokePreload & SendPreload & OnPreload;

  /** Custom window config */
  export interface CustomWindowConfig<T> extends T {
    loadUrl: string;
    handleEvent?: (win: BrowserWindow) => void;
  }

  /** Windows name */
  export type WindowName = "main" | "child-a";
}
