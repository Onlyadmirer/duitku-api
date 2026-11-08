import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "../../db";
import { budgets, categories, transactions, wallets } from "../../db/schema";
import { AppError } from "../../lib/error";
import { exportFileType, exportQueryType, exportSourceRows } from "./model";

type HasCreatedAt = { id: string, createdAt: Date }

const compareStr = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

// createdAt lalu id
const byCreatedAtThenId = (a: HasCreatedAt, b: HasCreatedAt) =>
  (a.createdAt.getTime() - b.createdAt.getTime()) || compareStr(a.id, b.id)

// date lalu createdAt lalu id
const byDateThenCreatedAtThenId = (
  a: HasCreatedAt & { date: string },
  b: HasCreatedAt & { date: string }
) => compareStr(a.date, b.date) || byCreatedAtThenId(a, b)

const toEpochMs = (value: Date) => {
  const ms = value.getTime()
  if (!Number.isFinite(ms)) {
    throw new Error("Export: invalid createdAt value")
  }
  return ms
}

const toInt = (value: number | string, field: string) => {
  const n = Number(value)
  if (!Number.isSafeInteger(n)) {
    throw new Error(`Export: invalid numeric value for ${field}`)
  }
  return n
}

/**
 * Fungsi pemetaan murni (tanpa database): mengubah baris mentah menjadi format
 * file ekspor version 1. UUID diganti nomor urut integer per tabel, dan semua
 * referensi diterjemahkan lewat Map uuid -> nomor.
 *
 * Melempar Error biasa (500) jika ada referensi yang tidak ditemukan, supaya
 * tidak pernah menghasilkan file yang rusak.
 */
export function toExportFormat(rows: exportSourceRows, exportedAt: Date = new Date()): exportFileType {
  const walletRows = [...rows.wallets].sort(byCreatedAtThenId)
  const categoryRows = [...rows.categories].sort(byCreatedAtThenId)
  const transactionRows = [...rows.transactions].sort(byDateThenCreatedAtThenId)
  const budgetRows = [...rows.budgets].sort(byCreatedAtThenId)

  const walletIdMap = new Map<string, number>()
  const categoryIdMap = new Map<string, number>()

  const exportedWallets = walletRows.map((w, i) => {
    const id = i + 1
    walletIdMap.set(w.id, id)
    return {
      id,
      name: w.name,
      initialBalance: toInt(w.initialBalance, "initialBalance"),
      createdAt: toEpochMs(w.createdAt)
    }
  })

  const exportedCategories = categoryRows.map((c, i) => {
    const id = i + 1
    categoryIdMap.set(c.id, id)
    return {
      id,
      name: c.name,
      type: c.type,
      color: c.color,
      createdAt: toEpochMs(c.createdAt)
    }
  })

  const exportedTransactions = transactionRows.map((tx, i) => {
    const walletId = walletIdMap.get(tx.walletId)
    if (walletId === undefined) {
      throw new Error(`Export: transaction references unknown wallet (row ${i + 1})`)
    }
    const categoryId = categoryIdMap.get(tx.categoryId)
    if (categoryId === undefined) {
      throw new Error(`Export: transaction references unknown category (row ${i + 1})`)
    }
    return {
      id: i + 1,
      walletId,
      categoryId,
      amount: toInt(tx.amount, "amount"),
      type: tx.type,
      note: tx.note ?? null,
      date: tx.date,
      createdAt: toEpochMs(tx.createdAt)
    }
  })

  const exportedBudgets = budgetRows.map((b, i) => {
    const categoryId = categoryIdMap.get(b.categoryId)
    if (categoryId === undefined) {
      throw new Error(`Export: budget references unknown category (row ${i + 1})`)
    }
    return {
      id: i + 1,
      categoryId,
      month: b.month,
      limitAmount: toInt(b.limitAmount, "limitAmount"),
      createdAt: toEpochMs(b.createdAt)
    }
  })

  return {
    format: "duitku-export",
    version: 1,
    exportedAt: exportedAt.toISOString(),
    currency: "IDR",
    data: {
      wallets: exportedWallets,
      categories: exportedCategories,
      transactions: exportedTransactions,
      budgets: exportedBudgets
    }
  }
}

export const Export = {

  async fetchRows(userId: string, q: exportQueryType): Promise<exportSourceRows> {
    // Filter tanggal hanya untuk transaksi; data lain selalu lengkap milik user.
    const txConditions = [
      eq(transactions.userId, userId)
    ]
    if (q.from) {
      txConditions.push(gte(transactions.date, q.from))
    }
    if (q.to) {
      txConditions.push(lte(transactions.date, q.to))
    }

    const walletsPromise = db.select({
      id: wallets.id,
      name: wallets.name,
      initialBalance: wallets.initialBalance,
      createdAt: wallets.createdAt
    }).from(wallets)
      .where(eq(wallets.userId, userId))
      .orderBy(asc(wallets.createdAt), asc(wallets.id))

    const categoriesPromise = db.select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
      color: categories.color,
      createdAt: categories.createdAt
    }).from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.createdAt), asc(categories.id))

    const transactionsPromise = db.select({
      id: transactions.id,
      walletId: transactions.walletId,
      categoryId: transactions.categoryId,
      amount: transactions.amount,
      type: transactions.type,
      note: transactions.note,
      date: transactions.date,
      createdAt: transactions.createdAt
    }).from(transactions)
      .where(and(...txConditions))
      .orderBy(asc(transactions.date), asc(transactions.createdAt), asc(transactions.id))

    const budgetsPromise = db.select({
      id: budgets.id,
      categoryId: budgets.categoryId,
      month: budgets.month,
      limitAmount: budgets.limitAmount,
      createdAt: budgets.createdAt
    }).from(budgets)
      .where(eq(budgets.userId, userId))
      .orderBy(asc(budgets.createdAt), asc(budgets.id))

    const [walletRows, categoryRows, transactionRows, budgetRows] = await Promise.all([
      walletsPromise,
      categoriesPromise,
      transactionsPromise,
      budgetsPromise
    ])

    return {
      wallets: walletRows,
      categories: categoryRows,
      transactions: transactionRows,
      budgets: budgetRows
    }
  },

  async build(userId: string, q: exportQueryType): Promise<exportFileType> {
    if (q.from && q.to && q.from > q.to) {
      throw new AppError(400, "BAD_REQUEST", "Date range invalid")
    }

    const rows = await Export.fetchRows(userId, q)

    return toExportFormat(rows)
  }
}
