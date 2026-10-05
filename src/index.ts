import { Elysia } from "elysia";
import { authModules } from "./modules/auth";
import openapi from "@elysia/openapi";
import { userModules } from "./modules/users";
import { categoryModules } from "./modules/category";
import { errorHandler } from "./plugin/errorHandler";
import { transactionModules } from "./modules/transaction";

const app = new Elysia()
  .use(openapi())
  .use(errorHandler)
  .use(authModules)
  .use(userModules)
  .use(categoryModules)
  .use(transactionModules)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
