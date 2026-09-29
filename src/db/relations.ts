// relations.ts
import * as schema from "./schema"
import { defineRelations } from "drizzle-orm"

export const relations = defineRelations(schema, (r) => ({
  users: {
    accounts: r.many.accounts(),
    refreshToken: r.many.refreshTokens(),
    carts: r.many.carts(),
    orders: r.many.orders()
  },

  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      to: r.users.id
    })
  },

  categories: {
    product: r.many.products()
  },

  products: {
    categories: r.one.categories({
      from: r.products.categoryId,
      to: r.categories.id
    }),
    cartItems: r.many.carts(),
    orderItems: r.many.orderItems()
  },

  carts: {
    product: r.one.products(),
    user: r.one.users()
  },

  orders: {
    user: r.one.users({
      from: r.users.id,
      to: r.orders.userId
    }),
    items: r.many.orderItems()
  },

  orderItems: {
    product: r.one.products({
      from: r.products.id,
      to: r.orderItems.productId
    }),
    order: r.one.orders({
      from: r.orders.id,
      to: r.orderItems.orderId
    })
  },

  refreshTokens: {
    user: r.one.users({
      from: r.refreshTokens.userId,
      to: r.users.id
    })
  }
}));
