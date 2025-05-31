import "reflect-metadata";

export function RegisterWindow(name: string) {
  return function (target: any) {
    Reflect.defineMetadata("window:name", name, target);
  };
}
