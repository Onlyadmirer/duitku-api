import { Static, t } from "elysia";

export const month = t.String({ pattern: '^[0-9]{4}-(0[1-9]|1[0-2])$' })

export const budgetQuery = t.Object({ month })

export const budgetUpsert = t.Object({
  categoryId: t.String({ format: "uuid" }),
  month: month,
  limitAmount: t.Integer({ minimum: 1, default: 500000 })
})

export type budgetUpsertType = Static<typeof budgetUpsert>