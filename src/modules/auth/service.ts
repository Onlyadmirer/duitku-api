
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { userRegInput } from "./model";
import * as argon2 from "argon2"

export const User = {
  async createUser(data: userRegInput) {
    const [exist] = await db.select().from(users).where(eq(users.email, data.email))

    if (exist) {
      throw new Error("Email already exist")
    }

    const hashedPass = await argon2.hash(data.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
    })

    const [newUser] = await db.insert(users).values({
      email: data.email,
      password: hashedPass,
    }).returning({ id: users.id, email: users.email })

    return newUser
  }
}