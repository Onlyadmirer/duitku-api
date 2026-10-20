import Elysia from "elysia"
import { authGuard } from "../../plugin/authGuard"
import { User } from "./service"

export const userModules = new Elysia({
  prefix: "/me",
  detail: {
    tags: ["User"]
  }
}).use(authGuard)
  .get("/", async ({ userId }) => {
    const user = await User.get(userId)

    return {
      success: true,
      id: userId,
      user
    }
  })