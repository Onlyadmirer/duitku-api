// modules/user/model.ts (Ini adalah Model Validasi HTTP /
import { Static, t } from 'elysia';

export const ProductsModel = t.Object({
  id: t.Number(),
  name: t.String({ minLength: 2 }),
  price: t.Integer({ minimum: 0 }),
  stock: t.Integer({ minimum: 0 }),
  imageUrl: t.String({ minLength: 2 }),
  category: t.String({ minLength: 2 }),
  createdAt: t.Date(),
  updatedAt: t.Date()
});
export const CreateProductsSchema = t.Object({
  name: t.String({ minLength: 2 }),
  price: t.Integer({ minimum: 0 }),
  stock: t.Integer({ minimum: 0 }),
  imageUrl: t.String({ minLength: 2 }),
  category: t.String({ minLength: 2 }),
});

export type CreateProductsInput = Static<typeof CreateProductsSchema>;