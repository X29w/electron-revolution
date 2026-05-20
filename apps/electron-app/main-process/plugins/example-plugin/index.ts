/**
 * @description [zh-CN] 示例插件 — 展示如何用纯函数方式编写插件
 * @description [zh-TW] 範例插件 — 展示如何用純函數方式編寫插件
 * @description [en] Example plugin — demonstrates how to write a plugin with pure functions
 * @description [ja] サンプルプラグイン — 純粋関数でプラグインを書く方法を示す
 */

import { definePlugin, defineHandlers, defineListeners } from "@x-industry/elevolution-core";

const handlers = defineHandlers({
  "example:greet": (_, name: string) => `Hello, ${name}!`,
  "example:time": () => new Date().toISOString(),
});

const listeners = defineListeners({
  "example:log": (_, message: string) => {
    console.log("[example]", message);
  },
});

export const examplePlugin = definePlugin({
  meta: {
    name: "example",
    version: "1.0.0",
    description: "A demo plugin showing the functional plugin API",
  },

  /**
   * @description [zh-CN] 暴露给其他插件的 API
   * @description [zh-TW] 暴露給其他插件的 API
   * @description [en] API exposed to other plugins
   * @description [ja] 他のプラグインに公開する API
   */
  api: {
    greet: (name: string) => `Hello, ${name}!`,
  },

  setup(ctx) {
    ctx.ipc(handlers.routes);
    ctx.ipc(listeners.routes);

    ctx.command("example:sayHi", () => {
      ctx.log.info("Hi from example plugin!");
      ctx.emit("example:greeted");
    });

    ctx.on("plugin:activated", (name: string) => {
      ctx.log.info(`Plugin activated: ${name}`);
    });

    ctx.log.info("ready");

    return () => {
      ctx.log.info("cleaning up");
    };
  },
});
