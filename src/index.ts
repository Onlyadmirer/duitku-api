import { Elysia } from "elysia";
import { productModules } from "./modules/products";

const app = new Elysia().get("/", () => "Hello Elysia").use(productModules).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
