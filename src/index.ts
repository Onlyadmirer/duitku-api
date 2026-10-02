import { Elysia } from "elysia";
import { userModules } from "./modules/auth";
import { errorHandler } from "./modules/plugin/errorHandler";
import openapi from "@elysia/openapi";

const app = new Elysia().use(openapi()).use(errorHandler).use(userModules).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
