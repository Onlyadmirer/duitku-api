
import { pgTable, varchar, timestamp, uuid, text, primaryKey, serial, integer } from 'drizzle-orm/pg-core';

// products
export const users = pgTable("users", {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password'),
  image: text('image'),
  role: text('role').default('user').notNull(),
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
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(), // Contoh: 'google'
    providerAccountId: text('provider_account_id').notNull(), // Google Sub ID / User ID unik
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Mencegah provider & providerAccountId yang sama terdaftar dua kali
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ]
);

// 3. Tabel Refresh Tokens (Opsional - Jika menggunakan Refresh Token Rotation)
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});


export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  price: integer('price').notNull(),
  stock: integer('stock').notNull().default(0),
  imageUrl: varchar('image_url', { length: 255 }).notNull(),


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

