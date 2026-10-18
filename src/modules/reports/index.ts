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

    return {
      success: true,
      items: reports
    }
  }, {
    query: monthQuery
  })
  .get("/monthly-trend", async ({ userId, query: { year } }) => {

    const strYear = Number(year)

    const months = await Reports.monthlyTrend(userId, strYear)

    return {
      success: true,
      items: months
    }
  }, {
    query: t.Object({
      year: t.String({ pattern: '^[0-9]{4}' })
    })
  })
  .get("/wallet-balances", async ({ userId }) => {
    const balances = await Reports.walletBalances(userId)

    return {
      success: true,
      items: balances
    }
  })