import { Elysia } from "elysia";
import { productModules } from "./modules/products";
import { userModules } from "./modules/auth";

const app = new Elysia().get("/", () => "Hello Elysia").use(productModules).use(userModules).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
