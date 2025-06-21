import "reflect-metadata";

/** register window */
export function RegisterWindow(name: Electron.WindowName) {
  return function (target: any) {
    Reflect.defineMetadata("window:name", name, target);
  };
}
