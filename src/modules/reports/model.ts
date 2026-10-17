import { t } from "elysia"


export const monthQuery = t.Object(
  { month: t.Optional(t.String({ pattern: '^[0-9]{4}-(0[1-9]|1[0-2])$' })) }
)
export const yearQuery = t.Object({
  year: t.Numeric({ minimum: 2000, maximum: 2100 })
})
