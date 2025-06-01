import { WindowManager } from "@main/windows/window-manager";

/** auto register windows */
export function AutoRegisterWindows(classes: any[]) {
  return function (_target: any) {
    for (const Clazz of classes) {
      const name = Reflect.getMetadata("window:name", Clazz);
      if (!name) {
        throw new Error(
          `Window class "${Clazz.name}" missing @RegisterWindow("name")`,
        );
      }
      WindowManager.register(name, Clazz);
    }
  };
}
