import Elysia from "elysia";
import { accessJwt } from "./jwt";

export const authGuard = new Elysia({ name: "auth-guard" })
  .use(accessJwt)
  .resolve({ as: 'scoped' }, async ({ accessJwt, cookie: { access_token }, status }) => {

    const token = access_token.value

    if (!token) {
      return status(401, {
        message: "Token not found"
      })
    }

    const isTokenValid = await accessJwt.verify(token.toString())

    if (!isTokenValid) {
      return status(401, {
        message: "Token invalid"
      })
    }

    return {
      userId: isTokenValid.id
    }
  })