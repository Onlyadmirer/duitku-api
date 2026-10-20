import { eq } from "drizzle-orm"
import { db } from "../../db"
import { users } from "../../db/schema"
import { AppError } from "../../lib/error"

export const User = {
  async get(userId: string) {
    const [data] = await db.select({
      name: users.name,
      email: users.email
    }).from(users).where(
      eq(users.id, userId)
    )

    if (!data) {
      throw new AppError(404, "NOT_FOUND", "User not found")
    }

    return data
  }
}