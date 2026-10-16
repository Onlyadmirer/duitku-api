import { and, eq, gte, lt, sql, sum } from "drizzle-orm";
import { db } from "../../db";
import { transactions, wallets } from "../../db/schema";

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

    const expense = Number(monthlyTotals.find(item => {
      item.type === "expense"
    })?.total ?? "0")

    const income = Number(monthlyTotals.find(item => {
      item.type === "income"
    })?.total ?? "0")

    const net = income - expense

    // all time transaction
    const allTimeTotals = await db.select({
      type: transactions.type,
      total: sql<number>`coalesce(sum(${transactions.amount}), 0)`.mapWith(Number)
    }).from(transactions).where(
      eq(transactions.userId, userId)
    ).groupBy(transactions.type)

    const totalExpense = Number(allTimeTotals.find(item => {
      item.type === "expense"
    })?.total ?? "0")

    const totalIncome = Number(allTimeTotals.find(item => {
      item.type === "income"
    })?.total ?? "0")

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
  }
}