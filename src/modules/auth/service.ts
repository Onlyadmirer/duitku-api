
import { db } from "../../db";
import { users } from "../../db/schema";
import { userLoginInput, userRegInput } from "./model";
import * as argon2 from "argon2"

export const User = {
  // register
  async createUser(data: userRegInput) {
    const exist = await db.query.users.findFirst({
      where: {
        email: data.email
      }
    })

    if (exist) {
      throw new Error("Email already exist")
    }

    const hashedPass = await argon2.hash(data.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
    })

    const [newUser] = await db.insert(users).values({
      name: data.name,
      email: data.email,
      password: hashedPass,
    }).returning({ id: users.id, email: users.email })

    return newUser
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
      throw new Error("Silahkan login dengan cara lain")
    }

    const isValid = await argon2.verify(user.password, data.password)

    if (!isValid) {
      throw new Error("Email atau password salah")
    }

    return {
      id: user.id,
      email: user.email
    }
  }
}