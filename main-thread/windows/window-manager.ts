// windows/window-manager.ts
import { BrowserWindow } from "electron";

export interface IWindow {
  create(): BrowserWindow;
}

export class WindowManager {
  private static registry = new Map<string, new () => IWindow>();
  private static instances = new Map<string, BrowserWindow>();

  static register(name: string, clazz: new () => IWindow) {
    if (this.registry.has(name)) {
      throw new Error(`Window "${name}" already registered.`);
    }
    this.registry.set(name, clazz);
  }

  static createWindow(name: string): BrowserWindow {
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

  static getWindow(name: string): BrowserWindow | undefined {
    return this.instances.get(name);
  }

  static hasWindow(name: string): boolean {
    return this.instances.has(name);
  }
}
