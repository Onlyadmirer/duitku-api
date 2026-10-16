import Elysia from "elysia";
import { authGuard } from "../../plugin/authGuard";
import { Reports } from "./service";
import { monthQuery } from "./model";

export const reportModules = new Elysia({
  prefix: "/reports",
  detail: {
    tags: ["Reports"]
  }
}).use(authGuard)
  .get("/", async ({ userId, query: { month } }) => {
    const summary = await Reports.summary(userId, month)

    return {
      success: true,
      data: summary
    }
  }, {
    query: monthQuery
  })