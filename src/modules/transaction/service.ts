
import { db } from "../../db";
import { createTransactionType, listTransactionQuery, updateTransactionType } from "./model";
import { AppError } from "../../lib/error";
import { transactions } from "../../db/schema";
import { and, desc, eq, gte, ilike, lte } from "drizzle-orm";

export const Transaction = {

  async list(userId: string, q: listTransactionQuery) {
    const conditions = [
      eq(transactions.userId, userId)
    ]

    if (q.from) {
      conditions.push(gte(transactions.date, q.from))
    }
    if (q.to) {
      conditions.push(lte(transactions.date, q.to))
    }
    if (q.search) {
      conditions.push(ilike(transactions.note, `%${q.search}%`))
    }

    const itemsPromise = db.select().from(transactions).where(and(
      ...conditions
    )).orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(q.limit)
      .offset((q.page - 1) * q.limit)

    const totalPromise = db.$count(transactions, and(...conditions))

    const [items, total] = await Promise.all([
      itemsPromise,
      totalPromise
    ])

    return {
      items,
      total,
      page: q.page,
      limit: q.limit
    }
  },

  async create(userId: string, data: createTransactionType) {
    const user = await db.query.wallets.findFirst({
      where: {
        userId: userId
      }
    })

    if (!user) {
      throw new AppError(404, "NOT_FOUND", "user not found")
    }
    const category = await db.query.categories.findFirst({
      where: {
        userId: userId,
      }
    })

    if (!category) {
      throw new AppError(404, "NOT_FOUND", "category not found")
    }

    if (category.type !== data.type) {
      throw new AppError(400, "BAD_REQUEST", "category type does not match transaction type")
    }

    const [addTransaction] = await db.insert(transactions).values({
      userId: userId,
      walletId: data.walletId,
      categoryId: data.categoryId,
      amount: data.amount,
      note: data.note,
      date: data.date,
      type: data.type
    }).returning({
      id: transactions.id,
      userId: transactions.userId,
      walletId: transactions.walletId,
      categoryId: transactions.categoryId,
      amount: transactions.amount,
      note: transactions.note,
      date: transactions.date,
      type: transactions.type
    })

    if (!addTransaction) {
      throw new Error("Failed to create transaction")
    }

    return addTransaction
  },

  async getOne(userId: string, id: string) {
    const [transaction] = await db.select().from(transactions).where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.id, id))
    )

    if (!transaction) {
      throw new AppError(404, "NOT_FOUND", "transaction Not found")
    }

    return transaction
  },

  async updateTransaction(userId: string, id: string, data: updateTransactionType) {
    const [transaction] = await db.update(transactions).set(data).where(and(
      eq(transactions.userId, userId),
      eq(transactions.id, id)
    )).returning({
      id: transactions.id,
      userId: transactions.userId,
      walletId: transactions.walletId,
      amount: transactions.amount,
      type: transactions.type,
      note: transactions.note,
      createdAt: transactions.createdAt,
      date: transactions.date,
      categoryId: transactions.categoryId
    })

    if (!transaction) {
      throw new AppError(404, "NOT_FOUND", "transaction not found")
    }

    return transaction
  },

  async delete(userId: string, id: string) {
    const [transaction] = await db.delete(transactions).where(and(
      eq(transactions.userId, userId),
      eq(transactions.id, id)
    )).returning({
      id: transactions.id
    })

    if (!transaction) {
      throw new AppError(404, "NOT_FOUND", "failed to delete transaction")
    }
  }
}