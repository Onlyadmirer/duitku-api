import Elysia from "elysia"
import { authGuard } from "../../plugin/authGuard"

export const userModules = new Elysia({
  prefix: "/me",
  detail: {
    tags: ["User"]
  }
}).use(authGuard)
  .get("/", async ({ userId }) => {
    return userId
  })