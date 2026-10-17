import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { budgets, categories } from "../../db/schema";
import { AppError } from "../../lib/error";
import { budgetUpsertType } from "./model";

export const Budgets = {

  async list(userId: string, month: string) {
    const items = await db.select({
      id: budgets.id,
      categoryId: budgets.categoryId,
      categoryName: categories.name,
      color: categories.color,
      month: budgets.month,
      limitAmount: budgets.limitAmount
    }).from(budgets).where(
      and(
        eq(budgets.userId, userId),
        eq(budgets.month, month)
      )
    ).innerJoin(
      categories,
      eq(budgets.categoryId, categories.id)
    ).groupBy(
      budgets.id,
      categories.id
    )

    return {
      month,
      items
    }

  },

  async upsert(userId: string, data: budgetUpsertType) {
    const category = await db.query.categories.findFirst({
      where: {
        id: data.categoryId,
        userId
      }
    })

    if (!category) {
      throw new AppError(404, "NOT_FOND", "Category not found")
    }

    if (category.type !== "expense") {
      throw new AppError(400, "BAD_REQUEST", "bad request")
    }

    const newBudgets = await db.insert(budgets).values({
      userId: userId,
      categoryId: data.categoryId,
      limitAmount: data.limitAmount,
      month: data.month
    }).onConflictDoUpdate({
      target: [budgets.userId, budgets.categoryId, budgets.month],
      set: { limitAmount: data.limitAmount }
    }).returning()

    return newBudgets
  },

  async remove(userId: string, id: string) {
    const budget = await db.delete(budgets).where(
      and(
        eq(budgets.userId, userId),
        eq(budgets.id, id)
      )
    )

    if (!budget) {
      throw new AppError(404, "NOT_FOUND", "Budget not found")
    }
  }
}