import Router from "@koa/router";
import { ExampleEntity } from "@main-process/entities/Example.entity";
import Koa from "koa";
import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "./dev.db",
  entities: [ExampleEntity],
  synchronize: true,
});

export const startKoa = async () => {
  await AppDataSource.initialize();

  const app = new Koa();
  const router = new Router();

  router.get("/api/examples", async (ctx) => {
    const repo = AppDataSource.getRepository(ExampleEntity);
    const data = await repo.find();
    ctx.body = data;
  });

  app.use(router.routes()).use(router.allowedMethods());

  app.listen(3006, () => {
    console.log("Koa server running on http://localhost:3006");
  });
};
