import { pgTable, serial, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

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

