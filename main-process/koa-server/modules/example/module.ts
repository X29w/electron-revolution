import Router from "@koa/router";
import {
  createExample,
  deleteExample,
  getExampleById,
  getExamples,
  updateExample,
} from "./controller";

const router = new Router({ prefix: "/api/user" });

router
  .get("/", getExamples)
  .get("/:id", getExampleById)
  .post("/", createExample)
  .put("/:id", updateExample)
  .delete("/:id", deleteExample);

export default router;
