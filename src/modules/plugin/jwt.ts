import jwt from "@elysia/jwt";

export const accessJwt = jwt({
  name: "accessJwt",
  secret: process.env.ACCESS_TOKEN_SECRET!,
  exp: "15m"
})

