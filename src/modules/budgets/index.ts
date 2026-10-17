import Elysia, { t } from "elysia";
import { authGuard } from "../../plugin/authGuard";
import { Budgets } from "./service";
import { budgetQuery, budgetUpsert } from "./model";

export const budgetsModules = new Elysia({
  prefix: "/budgets",
  detail: {
    tags: ["Budgets"]
  }
}).use(authGuard)
  .get("/", async ({ userId, query: { month } }) => {
    const budgetLists = await Budgets.list(userId, month)

    return budgetLists
  }, {
    query: budgetQuery
  })
  .put("/", async ({ userId, body }) => {
    const newBudget = await Budgets.upsert(userId, body)

    return {
      success: true,
      data: newBudget
    }
  }, {
    body: budgetUpsert
  })
  .delete("/:id", async ({ userId, params: { id } }) => {
    await Budgets.remove(userId, id)

    return {
      success: true,
      message: "successfully delete budget"
    }
  }, {
    params: t.Object({
      id: t.String({ format: "uuid" })
    })
  })