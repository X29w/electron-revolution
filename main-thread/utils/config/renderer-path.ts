import { join } from "path";

export const getRendererPath = (name: string) =>
  join(__dirname, "../", "renderer", "render-thread", name, "index.html");
