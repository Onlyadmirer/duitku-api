import { Elysia } from "elysia";
import { productModules } from "./modules/products";
import { userModules } from "./modules/auth";
import { errorHandler } from "./modules/plugin/errorHandler";

const app = new Elysia().use(errorHandler).use(productModules).use(userModules).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
