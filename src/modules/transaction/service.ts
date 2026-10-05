
import { db } from "../../db";
import { createTransactionType } from "./model";
import { AppError } from "../../lib/error";
import { transactions } from "../../db/schema";

export const Transaction = {
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
    })

    if (!addTransaction) {
      throw new Error("Failed to create transaction")
    }

    return addTransaction
  }
}