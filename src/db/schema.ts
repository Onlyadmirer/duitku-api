
import { pgTable, varchar, timestamp, uuid, text, integer, pgEnum, unique } from 'drizzle-orm/pg-core';


export const roleEnum = pgEnum('role', ['admin', 'customer']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'shipped', 'completed', 'cancelled']);

// products
export const users = pgTable("users", {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password'), // <-- Sekarang menjadi opsional (nullable)
  role: roleEnum('role').default('customer').notNull(),
  address: text('address'),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    provider: varchar('provider', { length: 50 }).notNull(), // Contoh: 'google'
    providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(), // ID Unik dari Google
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Mencegah provider & providerAccountId yang sama terdaftar dua kali
    unique('provider_account_id_unique').on(table.provider, table.providerAccountId)
  ]
);

// 3. Tabel Refresh Tokens (Opsional - Jika menggunakan Refresh Token Rotation)
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  tokenHash: varchar("token_hash", {
    length: 64,
  })
    .notNull()
    .unique(),
  familyId: uuid("family_id").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  revokedAt: timestamp("revoked_at", {
    withTimezone: true,
    mode: "date",
  }),
});


export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').references(() => categories.id).notNull(), // Foreign key jadi uuid
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  stock: integer('stock').notNull().default(0),
  imageUrl: text('image_url'),
  // time
  createdAt: timestamp('created_at',
    {
      mode: 'date',
      precision: 3, withTimezone: true
    }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at',
    {
      mode: 'date',
      precision: 3,
      withTimezone: true
    }).defaultNow().$onUpdate(() => new Date()),
});


export const carts = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at',
    {
      mode: 'date',
      precision: 3, withTimezone: true
    }).defaultNow().notNull(),
});


export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  totalAmount: integer('total_amount').notNull(),
  status: orderStatusEnum('status').default('pending').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  createdAt: timestamp('created_at',
    {
      mode: 'date',
      precision: 3, withTimezone: true
    }).defaultNow().notNull(),
});


export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  price: integer('price').notNull(),
});