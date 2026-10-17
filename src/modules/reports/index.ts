import Elysia, { t } from "elysia";
import { authGuard } from "../../plugin/authGuard";
import { Reports } from "./service";
import { monthQuery } from "./model";

export const reportModules = new Elysia({
  prefix: "/reports",
  detail: {
    tags: ["Reports"]
  }
}).use(authGuard)
  .get("/", async ({ userId, query }) => {

    const month = query.month ?? new Date().toISOString().slice(0, 7)

    const summary = await Reports.summary(userId, month)

    return {
      success: true,
      data: summary
    }
  }, {
    query: monthQuery
  })
  .get("/by-category", async ({ userId, query }) => {

    const month = query.month ?? new Date().toISOString().slice(0, 7)

    const reports = await Reports.byCategory(userId, month)

    return reports
  }, {
    query: monthQuery
  })