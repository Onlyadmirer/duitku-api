import Elysia from "elysia";
import { authGuard } from "../../plugin/authGuard";
import { Budgets } from "./service";
import { budgetUpsert } from "./model";

export const budgetsModules = new Elysia({
  prefix: "/budgets",
  detail: {
    tags: ["Budgets"]
  }
}).use(authGuard)
  .put("/:id", async ({ userId, body }) => {
    const newBudget = await Budgets.upsert(userId, body)

    return {
      success: true,
      data: newBudget
    }
  }, {
    body: budgetUpsert
  })