import { and, asc, eq } from "drizzle-orm"
import { db } from "../../db"
import { categories } from "../../db/schema"
import { categoryCreateInput, categoryType, categoryUpdateInput } from "./model"
import { AppError } from "../lib/error"

export const Category = {

  async list(userId: string, type: categoryType) {
    const categoryList = await db.select()
      .from(categories)
      .where(and(
        eq(categories.userId, userId),
        eq(categories.type, type.type)
      ))
      .orderBy(asc(categories.name))

    return categoryList
  },

  async create(userId: string, data: categoryCreateInput) {
    await db.insert(categories).values({
      userId: userId,
      name: data.name,
      type: data.type,
      color: data.color
    })
  },


  async update(userId: string, id: string, data: categoryUpdateInput) {
    const [updateCategory] = await db.update(categories).set({
      name: data.name,
      type: data.type,
      color: data.color
    }).where(and(
      eq(categories.userId, userId),
      eq(categories.id, id)
    )).returning({
      name: categories.name,
      type: categories.type,
      color: categories.color
    })

    if (!updateCategory) {
      throw new AppError(404, "NOT_FOUND", "update failed")
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
        throw new AppError(404, "NOT_FOUND", "delete failed")
      }
    } catch (err) {
      if (
        err instanceof Error &&
        err.cause &&
        typeof err.cause === "object" &&
        "code" in err.cause &&
        "constraint_name" in err.cause &&
        err.cause.code === "23505" &&
        err.cause.constraint_name === "users_email_key"
      ) {
        throw new AppError(409, "EMAIL_TAKEN", "Email already exists")
      }

      throw err
    }
  }
}