import { WindowManager } from "@main-process/utils/config/main-process/window-manager";

/** auto register windows */
export const AutoRegisterWindows = (classes: any[]) => {
  return (_target: any) => {
    for (const Clazz of classes) {
      const name = Reflect.getMetadata("window:name", Clazz);
      if (!name) {
        throw new Error(
          `Window class "${Clazz.name}" missing @RegisterWindow("name")`
        );
      }
      WindowManager.register(name, Clazz);
    }
  };
};
