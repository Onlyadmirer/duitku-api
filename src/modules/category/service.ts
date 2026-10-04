import { and, asc, eq } from "drizzle-orm"
import { db } from "../../db"
import { categories } from "../../db/schema"
import { categoryCreateInput, categoryList, categoryUpdateInput } from "./model"
import { AppError } from "../lib/error"
import { isPgError } from "../lib/pgError"

export const Category = {

  async list(userId: string, query: categoryList) {
    return await db.select()
      .from(categories)
      .where(and(
        eq(categories.userId, userId),
        query.type ? eq(categories.type, query.type) : undefined
      ))
      .orderBy(asc(categories.name))

  },

  async getOne(userId: string, id: string) {
    const [category] = await db.select().from(categories)
      .where(and(
        eq(categories.userId, userId),
        eq(categories.id, id)
      ))

    if (!category) {
      throw new AppError(404, "NOT_FOUND", "category not foud")
    }

    return category
  },

  async create(userId: string, data: categoryCreateInput) {
    const [newCategory] = await db.insert(categories).values({
      userId: userId,
      name: data.name,
      type: data.type,
      color: data.color
    }).returning({
      id: categories.id
    })

    if (!newCategory) {
      throw new Error("Failed to create category")
    }

    return newCategory
  },

  async update(userId: string, id: string, data: categoryUpdateInput) {
    const [updateCategory] = await db.update(categories).set({
      name: data.name,
      color: data.color
    }).where(and(
      eq(categories.userId, userId),
      eq(categories.id, id)
    )).returning({
      id: categories.id,
      name: categories.name,
      color: categories.color
    })

    if (!updateCategory) {
      throw new AppError(404, "NOT_FOUND", "category not found")
    }

    return updateCategory
  },

  async remove(userId: string, id: string) {
    try {
      const [deleteCategory] = await db.delete(categories).where(and(
        eq(categories.userId, userId),
        eq(categories.id, id)
      )).returning({ id: categories.id })

      if (!deleteCategory) {
        throw new AppError(404, "NOT_FOUND", "category not found")
      }
    } catch (err) {
      if (isPgError(err, "23503")) {
        throw new AppError(409, "CATEGORY_IN_USE", "category is still in use for transaction")
      }

      throw err
    }
  }
}