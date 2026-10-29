import Elysia from "elysia";
import { User } from "./service";
import { userLogin, userRegistration } from "./model";
import { generateRefreshToken, hashRefreshToken } from "../../utils/refreshToken";
import { db } from "../../db";
import { refreshTokens } from "../../db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import { accessJwt } from "../../plugin/jwt";
import { loginLimit, registerLimit } from "../../plugin/limiter";

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000
const isProduction = process.env.NODE_ENV === "production"

const registerRoutes = new Elysia()
  .use(registerLimit)
  .post("/register", async ({ body, set }) => {
    const newUser = await User.createUser(body)
    set.status = 201
    return { success: true, data: newUser }
  }, {
    body: userRegistration
  })

const loginRoutes = new Elysia().use(accessJwt)
  .use(loginLimit)
  .post("/login", async ({
    body,
    accessJwt,
    cookie: { access_token, refresh_token } }) => {

    const user = await User.loginUser(body)

    // generate access token
    const accessToken = await accessJwt.sign({
      id: user.id,
      email: user.email
    })

    // generate refresh token
    const refreshToken = generateRefreshToken()

    // hash refresh token
    const hashedRefreshToken = hashRefreshToken(refreshToken)

    // family baru
    const familyId = crypto.randomUUID()

    // simpan hash ke db
    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: hashedRefreshToken,
      familyId,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS)
    })

    // access token cookie
    access_token.set({
      value: accessToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 60 * 15,
    })

    // refresh token cookie
    refresh_token.set({
      value: refreshToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/api/auth",
      maxAge: 60 * 60 * 24 * 7,
    })

    return {
      succses: true,
      message: "Login success"
    }
  }, {
    body: userLogin
  })


export const authModules = new Elysia({
  prefix: "/auth",
  detail: {
    tags: ["Auth"]
  }
}).use(accessJwt)
  .post("/refresh", async ({
    accessJwt,
    status,
    cookie: {
      access_token,
      refresh_token, } }) => {

    const token = refresh_token.value

    if (!token) {
      return status(401, {
        message: "Refresh token tidak di temukan"
      })
    }

    const tokenString = token.toString()

    const tokenHash = hashRefreshToken(tokenString)

    const result = await db.transaction(async (tx) => {
      const [storedToken] = await tx.update(refreshTokens).set({
        revokedAt: new Date()
      }).where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, new Date())
        )
      ).returning({
        id: refreshTokens.id,
        userId: refreshTokens.userId,
        expiresAt: refreshTokens.expiresAt,
        familyId: refreshTokens.familyId,
      })

      if (!storedToken) {
        return null
      }

      const newRefreshToken = generateRefreshToken()
      const newHashedRefresehToken = hashRefreshToken(newRefreshToken)

      await tx.insert(refreshTokens).values({
        userId: storedToken.userId,
        tokenHash: newHashedRefresehToken,
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
        familyId: storedToken.familyId
      })

      return {
        storedToken,
        newRefreshToken
      }
    })

    if (!result) {

      const existingToken = await db.query.refreshTokens.findFirst({
        where: {
          tokenHash: tokenHash
        }
      })

      if (!existingToken) {

        access_token.set({ value: "", expires: new Date(0), maxAge: 0, path: "/" })
        refresh_token.set({ value: "", expires: new Date(0), maxAge: 0, path: "/api/auth" })

        return status(401, {
          success: false,
          message: "Token not found"
        })
      }

      if (existingToken.revokedAt) {
        await db.update(refreshTokens).set({
          revokedAt: new Date()
        })
          .where(
            and(
              eq(refreshTokens.familyId, existingToken.familyId),
              isNull(refreshTokens.revokedAt))
          )

        refresh_token.set({ value: "", expires: new Date(0), maxAge: 0, path: "/api/auth" })
        access_token.set({ value: "", expires: new Date(0), maxAge: 0, path: "/" })

        return status(401, {
          success: false,
          message: "Refresh token reuse detected"
        })
      }

      if (existingToken.expiresAt <= new Date()) {
        access_token.set({ value: "", expires: new Date(0), maxAge: 0, path: "/" })
        refresh_token.set({ value: "", expires: new Date(0), maxAge: 0, path: "/api/auth" })

        return status(401, {
          success: false,
          message: "Refresh token expired"
        })
      }

      refresh_token.set({ value: "", expires: new Date(0), maxAge: 0, path: "/api/auth" })
      access_token.set({ value: "", expires: new Date(0), maxAge: 0, path: "/" })

      return status(401, {
        status: false,
        message: "Refresh token tidak valid"
      })
    }


    const user = await db.query.users.findFirst({
      where: {
        id: result.storedToken.userId
      }
    })

    if (!user) {
      return status(401, {
        success: false,
        message: "User not found"
      })
    }

    const newAccessToken = await accessJwt.sign({
      id: user.id,
      email: user.email
    })

    access_token.set({
      value: newAccessToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 60 * 15,
    })

    // refresh token cookie
    refresh_token.set({
      value: result.newRefreshToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/api/auth",
      maxAge: 60 * 60 * 24 * 7,
    })

    return {
      success: true,
      message: "Token refreshed"
    }

  })
  .post("/logout", async ({ cookie: { access_token, refresh_token } }) => {
    const token = refresh_token.value

    if (token) {
      const tokenHash = hashRefreshToken(token.toString())


      await db.update(refreshTokens).set({
        revokedAt: new Date()
      }).where(eq(refreshTokens.tokenHash, tokenHash))
    }

    access_token.set({ value: "", expires: new Date(0), maxAge: 0, path: "/" })
    refresh_token.set({ value: "", expires: new Date(0), maxAge: 0, path: "/api/auth" })

    return {
      success: true,
      message: "Logout success"
    }
  })
  .use(registerRoutes)
  .use(loginRoutes)