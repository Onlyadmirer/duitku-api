import { Elysia } from "elysia";
import { authModules } from "./modules/auth";
import openapi from "@elysia/openapi";
import { userModules } from "./modules/users";
import { categoryModules } from "./modules/category";
import { errorHandler } from "./plugin/errorHandler";
import { transactionModules } from "./modules/transaction";
import { walletModules } from "./modules/wallet";
import { budgetsModules } from "./modules/budgets";
import { reportModules } from "./modules/reports";

const app = new Elysia({ prefix: "/api" })
  .use(openapi())
  .use(errorHandler)
  .use(authModules)
  .use(userModules)
  .use(categoryModules)
  .use(transactionModules)
  .use(walletModules)
  .use(budgetsModules)
  .use(reportModules)
  .get("/cronjob", () => {
    return {
      status: "ok"
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
