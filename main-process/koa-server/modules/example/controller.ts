import { Context } from "koa";
import { AppDataSource } from "../../db";
import { ExampleEntity } from "./entity";

const repo = AppDataSource.getRepository(ExampleEntity);

export async function getExamples(ctx: Context) {
  ctx.body = await repo.find();
}

export async function getExampleById(ctx: Context) {
  ctx.body = await repo.findOneBy({ id: Number(ctx.params.id) });
}

export async function createExample(ctx: Context) {
  const example = repo.create(ctx.request.body);
  ctx.body = await repo.save(example);
}

export async function updateExample(ctx: Context) {
  await repo.update(ctx.params.id, ctx.request.body);
  ctx.body = { success: true };
}

export async function deleteExample(ctx: Context) {
  await repo.delete(ctx.params.id);
  ctx.body = { success: true };
}
