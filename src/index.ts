import { Elysia } from "elysia";
import { authModules } from "./modules/auth";
import { errorHandler } from "./modules/plugin/errorHandler";
import openapi from "@elysia/openapi";
import { userModules } from "./modules/users";
import { categoryModules } from "./modules/category";

const app = new Elysia().use(openapi()).use(errorHandler).use(authModules).use(userModules).use(categoryModules).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
