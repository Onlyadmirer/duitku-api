// relations.ts
import * as schema from "./schema"
import { defineRelations } from "drizzle-orm"

export const relations = defineRelations(schema, (r) => ({
  users: {
    accounts: r.many.accounts(),
    refreshTokens: r.many.refreshTokens(),
    wallets: r.many.wallets(),
    transactions: r.many.transactions(),
    budgets: r.many.budgets(),
    categories: r.many.categories()
  },

  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      to: r.users.id
    })
  },

  categories: {
    budgets: r.many.budgets(),
    transactions: r.many.transactions(),
    user: r.one.users({
      from: r.categories.userId,
      to: r.users.id
    })
  },

  wallets: {
    transactions: r.many.transactions(),
    user: r.one.users({
      from: r.wallets.userId,
      to: r.users.id
    })
  },

  budgets: {
    category: r.one.categories({
      from: r.budgets.categoryId,
      to: r.categories.id
    }),
    user: r.one.users({
      from: r.budgets.userId,
      to: r.users.id
    })
  },

  transactions: {
    user: r.one.users({
      from: r.transactions.userId,
      to: r.users.id
    }),
    wallet: r.one.wallets({
      from: r.transactions.walletId,
      to: r.wallets.id
    }),
    category: r.one.categories({
      from: r.transactions.categoryId,
      to: r.categories.id,
    })
  },

  refreshTokens: {
    user: r.one.users({
      from: r.refreshTokens.userId,
      to: r.users.id
    })
  }
}));
