// modules/user/model.ts (Ini adalah Model Validasi HTTP /
import { Static, t } from 'elysia';

export const ProductsModel = t.Object({
  id: t.Number(),
  name: t.String({ minLength: 2 }),
  price: t.Integer({ minimum: 0 }),
  stock: t.Integer({ minimum: 0 }),
  createdAt: t.Date()
});
export const CreateProductsSchema = t.Object({
  name: t.String({ minLength: 2 }),
  price: t.Integer({ minimum: 0 }),
  stock: t.Integer({ minimum: 0 }),
});

export type CreateProductsInput = Static<typeof CreateProductsSchema>;