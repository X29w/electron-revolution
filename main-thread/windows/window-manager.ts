// windows/window-manager.ts
import { BrowserWindow } from "electron";

/** window interface */
export interface IWindow {
  create(): BrowserWindow;
}

/** window manager */
export class WindowManager {
  /** registry */
  private static registry = new Map<string, new () => IWindow>();
  /** instances */
  private static instances = new Map<string, BrowserWindow>();

  /** register window */
  static register(name: Electron.WindowName, clazz: new () => IWindow) {
    if (this.registry.has(name)) {
      throw new Error(`Window "${name}" already registered.`);
    }
    this.registry.set(name, clazz);
  }

  /** create window */
  static createWindow(name: Electron.WindowName): BrowserWindow {
    const Clazz = this.registry.get(name);
    if (!Clazz) throw new Error(`No window registered with name: ${name}`);

    const instance = new Clazz();
    const window = instance.create();
    this.instances.set(name, window);

    window.on("closed", () => {
      this.instances.delete(name);
    });

    return window;
  }

  /** get window */
  static getWindow(name: Electron.WindowName): BrowserWindow | undefined {
    return this.instances.get(name);
  }

  /** has window */
  static hasWindow(name: Electron.WindowName): boolean {
    return this.instances.has(name);
  }
}
