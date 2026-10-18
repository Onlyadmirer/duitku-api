import { and, eq, gte, lt, sql, sum } from "drizzle-orm";
import { db } from "../../db";
import { budgets, categories, transactions, wallets } from "../../db/schema";

function monthRange(date: string) {

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(date)) {
    throw new Error("Month format should be YYYY-MM")
  }

  const [year, month] = date.split("-").map(Number)

  const nextYear = month === 12 ? year + 1 : year
  const nextMonth = month === 12 ? 1 : month + 1

  return {
    start: `${year}-${String(month).padStart(2, "0")}-01`,
    end: `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`
  }

}

export const Reports = {

  async summary(userId: string, month: string) {

    const { start, end } = monthRange(month)

    // monthly transaction
    const monthlyTotals = await db.select({
      type: transactions.type,
      total: sql<number>`coalesce(sum(${transactions.amount}), 0)`.mapWith(Number)
    }).from(transactions).where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, start),
        lt(transactions.date, end)
      )
    ).groupBy(transactions.type)

    const expense = Number(monthlyTotals.find(item =>
      item.type === "expense"
    )?.total ?? "0")

    const income = Number(monthlyTotals.find(item =>
      item.type === "income"
    )?.total ?? "0")

    const net = income - expense

    // all time transaction
    const allTimeTotals = await db.select({
      type: transactions.type,
      total: sql<number>`coalesce(sum(${transactions.amount}), 0)`.mapWith(Number)
    }).from(transactions).where(
      eq(transactions.userId, userId)
    ).groupBy(transactions.type)

    const totalExpense = Number(allTimeTotals.find(item =>
      item.type === "expense"
    )?.total ?? "0")

    const totalIncome = Number(allTimeTotals.find(item =>
      item.type === "income"
    )?.total ?? "0")

    // saldo wallets
    const [walletTotal] = await db.select({
      total: sql<number>`coalesce(sum(${wallets.initialBalance}), 0)`.mapWith(Number)
    }).from(wallets).where(
      eq(wallets.userId, userId)
    )

    const balance = walletTotal.total + totalIncome - totalExpense

    return {
      month,
      income,
      expense,
      net,
      balance
    }
  },

  async byCategory(userId: string, month: string) {

    const datas = await db.select({
      categoryId: categories.id,
      name: categories.name,
      color: categories.color,
      limit: budgets.limitAmount,
      spent: sql<number>`coalesce(sum(${transactions.amount}), 0)`.mapWith(Number)
    }).from(categories)
      .leftJoin(
        transactions,
        and(
          eq(categories.id, transactions.categoryId),
          eq(transactions.userId, userId)
        )
      )
      .leftJoin(
        budgets,
        and(
          eq(categories.id, budgets.categoryId),
          eq(budgets.month, month)
        )
      )
      .where(
        and(
          eq(categories.userId, userId),
          eq(categories.type, "expense")
        )
      )
      .groupBy(
        categories.id,
        budgets.limitAmount
      )

    const items = datas.map(data => {

      if (data.limit === null) {
        return {
          ...data,
          percent: null,
          status: "tanpa-anggaran"
        }
      }

      const percent = data.spent * 100 / data.limit
      const remaining = data.limit - data.spent

      let status: string

      if (data.spent > data.limit) {
        status = "melebihi"
      } else if (percent >= 80) {
        status = "hampir-habis"
      } else {
        status = "aman"
      }

      return {
        ...data,
        remaining,
        percent,
        status
      }
    })

    return {
      month,
      items
    }
  },

  async monthlyTrend(userId: string, year: number) {

    const datas = await db.select({
      month: sql<string>`to_char(${transactions.date}, 'YYYY-MM')`,
      type: transactions.type,
      total: sql<number>`coalesce(sum(${transactions.amount}), '0')`
    }).from(transactions).where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, `${year}-01-01`),
        lt(transactions.date, `${year + 1}-01-01`)
      )
    ).groupBy(
      sql<string>`to_char(${transactions.date}, 'YYYY-MM')`,
      transactions.type
    ).orderBy(
      sql`to_char(${transactions.date}, 'YYYY-MM')`
    )

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: `${year}-${String(i + 1).padStart(2, "0")}`,
      income: 0,
      expense: 0,
      net: 0
    }))

    for (const data of datas) {
      const index = Number(data.month.slice(5, 7)) - 1

      if (data.type === "income") {
        months[index].income = data.total
      } else if (data.type === "expense") {
        months[index].expense = data.total
      }

      months[index].net = months[index].income - months[index].expense
    }

    return {
      year,
      months
    }
  },

  async walletBalances(userId: string,) {
    const datas = await db.select({
      id: wallets.id,
      name: wallets.name,
      initialBalance: wallets.initialBalance,
      type: transactions.type,
      total: sql<number>`coalesce(sum(${transactions.amount}), '0')`.mapWith(Number)
    }).from(wallets).leftJoin(
      transactions,
      eq(wallets.id, transactions.walletId)
    ).where(
      eq(wallets.userId, userId)
    ).groupBy(
      wallets.id,
      transactions.type,
      wallets.name,
      wallets.initialBalance
    )

    const items = datas.map((data) => {


      let income: number = 0
      let expense: number = 0

      if (data.type === "income") {
        income = data.total
      } else if (data.type === "expense") {
        expense = data.total
      }

      const balance = data.initialBalance + income - expense

      return {
        id: data.id,
        name: data.name,
        initialBalance: data.initialBalance,
        income: income,
        expense: expense,
        balance: balance
      }
    })

    return items

  }

}