// relations.ts
import * as schema from "./schema"
import { defineRelations } from "drizzle-orm"

export const relations = defineRelations(schema, (r) => ({
  users: {
    accounts: r.many.accounts()
  },

  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      to: r.users.id
    })
  },

  refreshTokens: {
    user: r.one.users({
      from: r.refreshTokens.userId,
      to: r.users.id
    })
  }
}));
