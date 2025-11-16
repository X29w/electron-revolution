declare namespace Ipc {
  /** 主进程 handle 路由（ipcMain.handle） */
  export interface Handle {
    /**
     * @zh-tw: 取得 electron-store 的所有值
     * @en-us: Get all values of electron-store
     * @jp: electron-store のすべての値を取得
     */
    "store:getAll": {
      args: [];
      return: ElectronStore.Options;
    };

    /**
     * @zh-tw: 從 electron-store 取得指定 key 的值
     * @en-us: Get the value of the specified key from electron-store
     * @jp: electron-store から指定された key の値を取得
     */
    "store:get": {
      args: [key: keyof ElectronStore.Options];
      return: ElectronStore[keyof ElectronStore.Options];
    };
  }

  /** 主进程 on 路由（ipcMain.on <- 渲染 send） */
  export interface On {
    /** 设置electron-store的值 */
    "store:set": {
      args: [
        key: keyof ElectronStore.Options,
        value: ElectronStore[keyof ElectronStore.Options]
      ];
    };

    /** 打开窗口 */
    "window:open": {
      args: [name: Electron.WindowName];
    };

    /** 关闭窗口 */
    "window:close": {
      args: [name: Electron.WindowName];
    };

    /**
     * @zh-tw: 最小化窗口
     * @en-us: Minimize window
     * @jp: 最小化ウィンドウ
     */
    "window:minimize": {
      args: [name: WindowName];
      return: void;
    };

    /**
     * @zh-tw: 最大化窗口
     * @en-us: Maximize window
     * @jp: 最大化ウィンドウ
     */
    "window:maximize": {
      args: [name: WindowName];
      return: void;
    };

    /**
     * @zh-tw: 还原窗口
     * @en-us: Revert window
     * @jp: ウィンドウを元に戻す
     */
    "window:unMaximize": {
      args: [name: WindowName];
      return: void;
    };
  }

  /** 主进程 send 路由（win.webContents.send -> 渲染 on） */
  export interface Send {
    "store:init": {
      args: [value: ElectronStore[keyof ElectronStore.Options]];
    };
  }

  // ---- 类型推导工具 ----
  export type HandleHandler<K extends keyof Handle> = (
    event: Electron.IpcMainInvokeEvent,
    ...args: Handle[K]["args"]
  ) => Promise<Handle[K]["return"]> | Handle[K]["return"];

  export type OnHandler<K extends keyof On> = (
    event: Electron.IpcMainEvent,
    ...args: On[K]["args"]
  ) => void;

  /** 主进程路由描述 */
  export type HandleRoute<K extends keyof Handle = keyof Handle> = {
    type: "handle";
    channel: K;
    handler: HandleHandler<K>;
  };

  export type OnRoute<K extends keyof On = keyof On> = {
    type: "on";
    channel: K;
    handler: OnHandler<K>;
  };

  export type IpcRoute =
    | { [K in keyof Handle]: HandleRoute<K> }[keyof Handle]
    | { [K in keyof On]: OnRoute<K> }[keyof On];
}
