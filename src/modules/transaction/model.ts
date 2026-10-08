import { Static, t } from "elysia";

export const createTransaction = t.Object({
  walletId: t.String({ format: "uuid" }),
  categoryId: t.String({ format: "uuid" }),
  amount: t.Integer({ minimum: 1 }),
  type: t.Union([
    t.Literal('income'),
    t.Literal('expense')
  ]),
  note: t.Optional(t.String({ maxLength: 200 })),
  date: t.String({ format: "date" })
})

export const transactionQuery = t.Object({
  from: t.Optional(t.String({ format: "date" })),
  to: t.Optional(t.String({ format: "date" })),
  search: t.Optional(t.String({ maxLength: 100 })),
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 }))
})

export const getOneTransaction = t.Object({
  id: t.String({ format: "uuid" })
})

export const updateTransaction = t.Object({
  walletId: t.Optional(t.String({ format: "uuid" })),
  categoryId: t.Optional(t.String({ format: "uuid" })),
  amount: t.Optional(t.Integer({ minimum: 1 })),
  note: t.Optional(t.String({ maxLength: 200 })),
  date: t.Optional(t.String({ format: "date" }))
}, {
  minProperties: 1
})

export type createTransactionType = Static<typeof createTransaction>
export type getOneTransactionType = Static<typeof getOneTransaction>
export type updateTransactionType = Static<typeof updateTransaction>
export type listTransaction = Static<typeof transactionQuery>
export type listTransactionQuery = Omit<listTransaction, "page" | "limit"> & {
  page: number,
  limit: number
}