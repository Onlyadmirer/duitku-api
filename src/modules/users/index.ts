import Elysia from "elysia"
import { authGuard } from "../../plugin/authGuard"

export const userModules = new Elysia({ prefix: "/me" }).use(authGuard)
  .get("/", async ({ userId }) => {
    return userId
  })