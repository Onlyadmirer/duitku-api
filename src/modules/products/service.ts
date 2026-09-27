import { db } from "../../db"
import { products } from "../../db/schema";
import { CreateProductsInput } from './model';

export const Products = {
  async getAll() {
    return await db.select().from(products)
  },

  async create(data: CreateProductsInput) {
    const [newProd] = await db.insert(products).values(data).returning()
    return newProd
  }
}