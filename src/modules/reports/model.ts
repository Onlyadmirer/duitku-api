import { Static, t } from "elysia"

export const month = t.String({ pattern: '^[0-9]{4}-(0[1-9]|1[0-2])$' })

export const monthQuery = t.Object({ month })
export const yearQuery = t.Object({
  year: t.Numeric({ minimum: 2000, maximum: 2100 })
})
