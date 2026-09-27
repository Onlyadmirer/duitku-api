import Elysia from "elysia";
import { User } from "./service";
import { userRegistration } from "./model";

export const userModules = new Elysia({ prefix: "/user" })
  .post("/", async ({ body, set }) => {
    const newUser = await User.createUser(body)
    set.status = 201
    return { success: true, data: newUser }
  }, {
    body: userRegistration
  })