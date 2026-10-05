
import { db } from "../../db";
import { defaultCategoriesFor } from "../../db/defaultCategories";
import { categories, users, wallets } from "../../db/schema";
import { AppError } from "../../lib/error";
import { isPgError } from "../../lib/pgError";
import { userLoginInput, userRegInput } from "./model";


export const User = {
  // register
  async createUser(data: userRegInput) {

    const email = data.email.trim().toLowerCase()

    const exist = await db.query.users.findFirst({
      where: {
        email: email
      }
    })

    if (exist) {
      throw new AppError(409, 'EMAIL_TAKEN', 'Email sudah terdaftar')
    }

    const hashedPass = await Bun.password.hash(data.password, {
      algorithm: "argon2id"
    })

    try {
      return await db.transaction(async (tx) => {
        const [newUser] = await tx.insert(users).values({
          name: data.name,
          email: email,
          password: hashedPass,
        }).returning({ id: users.id, name: users.name, email: users.email })

        if (!newUser) throw new Error("Failed to create user")

        await tx.insert(wallets).values({
          name: "Dompet Utama",
          initialBalance: 0,
          userId: newUser.id
        })

        await tx.insert(categories).values(
          defaultCategoriesFor(newUser.id)
        )

        return newUser
      })
    } catch (err) {
      if (isPgError(err, "23503")) {
        throw new AppError(409, "EMAIL_TAKEN", "Email already exist")
      }

      throw err
    }

  },

  // login
  async loginUser(data: userLoginInput) {
    const user = await db.query.users.findFirst({
      where: {
        email: data.email
      }
    })

    if (!user) {
      throw new Error("Email atau password salah")
    }

    if (!user.password) {
      throw new Error("Email atau password salah")
    }

    const isValid = await Bun.password.verify(data.password, user.password)

    if (!isValid) {
      throw new Error("Email atau password salah")
    }

    return {
      id: user.id,
      email: user.email
    }
  }
}