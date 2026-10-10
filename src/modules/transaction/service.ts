
import { db } from "../../db";
import { createTransactionType, listTransactionType, updateTransactionType } from "./model";
import { AppError } from "../../lib/error";
import { transactions } from "../../db/schema";
import { and, desc, eq, gte, ilike, lte } from "drizzle-orm";

export const Transaction = {

  async list(userId: string, q: listTransactionType) {
    const conditions = [
      eq(transactions.userId, userId)
    ]

    if (q.from && q.to) {
      if (q.from > q.to) {
        throw new AppError(400, "BAD_REQUEST", "Date range invalid")
      }
    }

    if (q.from) {
      conditions.push(gte(transactions.date, q.from))
    }
    if (q.to) {
      conditions.push(lte(transactions.date, q.to))
    }
    if (q.search) {
      conditions.push(ilike(transactions.note, `%${q.search}%`))
    }
    if (q.type) {
      conditions.push(eq(transactions.type, q.type))
    }
    if (q.categoryId) {
      conditions.push(eq(transactions.categoryId, q.categoryId))
    }
    if (q.walletId) {
      conditions.push(eq(transactions.walletId, q.walletId))
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
    const wallet = await db.query.wallets.findFirst({
      where: {
        userId: userId,
        id: data.walletId
      }
    })

    if (!wallet) {
      throw new AppError(404, "NOT_FOUND", "Wallet not found")
    }
    const category = await db.query.categories.findFirst({
      where: {
        userId: userId,
        id: data.categoryId
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
    }).returning()

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

    const checkTransaction = await db.query.transactions.findFirst({
      where: {
        id: id,
        userId: userId
      }
    })

    if (!checkTransaction) {
      throw new AppError(404, "NOT_FOUND", "Transaction not found")
    }

    if (data.walletId) {
      const wallet = await db.query.wallets.findFirst({
        where: {
          userId: userId,
          id: data.walletId
        }
      })
      if (!wallet) {
        throw new AppError(404, "NOT_FOUND", "Wallet not found")
      }
    }

    if (data.categoryId) {
      const category = await db.query.categories.findFirst({
        where: {
          userId: userId,
          id: data.categoryId
        }
      })

      if (!category) {
        throw new AppError(404, "NOT_FOUND", "category not found")
      }
      if (category.type !== checkTransaction.type) {
        throw new AppError(400, 'BAD_REQUEST', 'Tipe kategori tidak sesuai dengan transaksi')
      }
    }


    const [transaction] = await db.update(transactions).set({
      walletId: data.walletId,
      categoryId: data.categoryId,
      amount: data.amount,
      date: data.date,
      note: data.note,
    }).where(and(
      eq(transactions.userId, userId),
      eq(transactions.id, id)
    )).returning()

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
      throw new AppError(404, "NOT_FOUND", "Transaction not found")
    }
  }
}