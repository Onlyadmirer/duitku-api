import { Static, t } from "elysia";

export const exportQuery = t.Object({
  from: t.Optional(t.String({ format: "date" })),
  to: t.Optional(t.String({ format: "date" }))
})

const transactionTypeSchema = t.Union([
  t.Literal('income'),
  t.Literal('expense')
])

export const exportWallet = t.Object({
  id: t.Integer({ minimum: 1 }),
  name: t.String(),
  initialBalance: t.Integer(),
  createdAt: t.Integer()
})

export const exportCategory = t.Object({
  id: t.Integer({ minimum: 1 }),
  name: t.String(),
  type: transactionTypeSchema,
  color: t.String(),
  createdAt: t.Integer()
})

export const exportTransaction = t.Object({
  id: t.Integer({ minimum: 1 }),
  walletId: t.Integer({ minimum: 1 }),
  categoryId: t.Integer({ minimum: 1 }),
  amount: t.Integer(),
  type: transactionTypeSchema,
  note: t.Nullable(t.String()),
  date: t.String({ format: "date" }),
  createdAt: t.Integer()
})

export const exportBudget = t.Object({
  id: t.Integer({ minimum: 1 }),
  categoryId: t.Integer({ minimum: 1 }),
  month: t.String({ pattern: '^[0-9]{4}-(0[1-9]|1[0-2])$' }),
  limitAmount: t.Integer(),
  createdAt: t.Integer()
})

export const exportFile = t.Object({
  format: t.Literal("duitku-export"),
  version: t.Literal(1),
  exportedAt: t.String({ format: "date-time" }),
  currency: t.Literal("IDR"),
  data: t.Object({
    wallets: t.Array(exportWallet),
    categories: t.Array(exportCategory),
    transactions: t.Array(exportTransaction),
    budgets: t.Array(exportBudget)
  })
})

export type exportQueryType = Static<typeof exportQuery>
export type exportFileType = Static<typeof exportFile>

// Baris mentah dari database (hanya kolom yang dibutuhkan, tanpa userId).
export type exportSourceRows = {
  wallets: {
    id: string
    name: string
    initialBalance: number
    createdAt: Date
  }[]
  categories: {
    id: string
    name: string
    type: 'income' | 'expense'
    color: string
    createdAt: Date
  }[]
  transactions: {
    id: string
    walletId: string
    categoryId: string
    amount: number
    type: 'income' | 'expense'
    note: string | null
    date: string
    createdAt: Date
  }[]
  budgets: {
    id: string
    categoryId: string
    month: string
    limitAmount: number
    createdAt: Date
  }[]
}
