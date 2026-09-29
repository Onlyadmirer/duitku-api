import Elysia from "elysia";
import { User } from "./service";
import { userLogin, userRegistration } from "./model";
import { accessJwt } from "../plugin/jwt";
import { generateRefreshToken, hashRefreshToken } from "../utils/refreshToken";
import { db } from "../../db";
import { refreshTokens } from "../../db/schema";

export const userModules = new Elysia({ prefix: "/auth" }).use(accessJwt)
  .post("/register", async ({ body, set }) => {
    const newUser = await User.createUser(body)
    set.status = 201
    return { success: true, data: newUser }
  }, {
    body: userRegistration
  })
  .post("/login", async ({
    body,
    accessJwt,
    cookie: { access_token, refresh_token }, set }) => {

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
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      )
    })

    // access token cookie
    access_token.set({
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    })

    // refresh token cookie
    refresh_token.set({
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/auth",
      maxAge: 60 * 60 * 24 * 7,
    })

    set.status = 201
    return {
      succsess: true,
      message: "Login success"
    }
  }, {
    body: userLogin
  })
  .post("/refresh", async ({
    accessJwt,
    cookie: {
      access_token,
      refresh_token, } }) => {

    const token = refresh_token.value

  })