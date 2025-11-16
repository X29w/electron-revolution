import "reflect-metadata";

/** register window */
export const RegisterWindow = (name: Electron.WindowName) => {
  return (target: any) => {
    Reflect.defineMetadata("window:name", name, target);
  };
};
