
import { Elysia } from 'elysia';
import { CreateProductsSchema } from './model';
import { Products } from './service';

export const productModules = new Elysia({ prefix: '/products' })
  .get('/', async () => {
    const products = await Products.getAll();
    return { success: true, data: products };
  })
  .post('/', async ({ body, set }) => {
    const newProd = await Products.create(body);
    set.status = 201;
    return { success: true, data: newProd };
  }, {
    body: CreateProductsSchema // Menggunakan schema dari model.ts
  });