import Elysia, { t } from "elysia";
import { authGuard } from "../plugin/authGuard";
import { Category } from "./service";
import { category, categoryType } from "./model";

export const categoryModules = new Elysia({ prefix: "/categories" })
  .use(authGuard)
  .get("/", async ({ userId, query }) => {
    const listCat = await Category.list(userId, query)

    return {
      success: true,
      data: listCat
    }
  }, {
    query: categoryType
  })
  .post("/create", async ({ userId, body }) => {
    await Category.create(userId, body)

    return {
      success: true,
      message: "successfully create category"
    }
  }, { body: category })
  .patch("/update/:id", async ({ userId, params: { id }, body }) => {
    const update = await Category.update(userId, id, body)

    return update
  }, {
    params: t.Object({
      id: t.String({ format: "uuid" })
    }),
    body: category
  })
  .delete("/delete/:id", async ({ userId, params: { id } }) => {
    await Category.remove(userId, id)

    return {
      success: true,
      message: "Delete successfully"
    }
  }, {
    params: t.Object({
      id: t.String({ format: "uuid" })
    }),

  })