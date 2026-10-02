
import { pgTable, varchar, timestamp, uuid, text, pgEnum, unique, bigint, date, index } from 'drizzle-orm/pg-core';

const money = (name: string) => bigint(name, { mode: 'number' })

export const transactionType = pgEnum('transaction_type', ['income', 'expense'])

export const users = pgTable("users", {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password'), // <-- Sekarang menjadi opsional (nullable)
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
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

export const wallets = pgTable(
  'wallets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    initialBalance: money('initial_balance').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
)

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


export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: transactionType('type').notNull(),
    color: text('color').notNull().default('#6366f1'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
)


export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Tanpa onDelete eksplisit (NO ACTION): wallet/kategori yang masih punya
    // transaksi tidak bisa dihapus, tapi penghapusan user tetap bisa cascade.
    walletId: uuid('wallet_id')
      .notNull()
      .references(() => wallets.id),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id),
    amount: money('amount').notNull(),
    type: transactionType('type').notNull(),
    note: text('note'),
    date: date('date', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('transaction_user_date_idx').on(t.userId, t.date)
  ]
)

export const budgets = pgTable(
  'budgets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    // Format 'YYYY-MM'
    month: text('month').notNull(),
    limitAmount: money('limit_amount').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('budgets_user_category_month_uq').on(t.userId, t.categoryId, t.month)
  ]

)