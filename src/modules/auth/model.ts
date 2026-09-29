
import { Static, t } from "elysia";

export const userRegistration = t.Object({
  name: t.String(),
  email: t.String({ format: "email", error: "Format email tidak valid" }),
  password: t.String({ minLength: 8 })
})

export type userRegInput = Static<typeof userRegistration>