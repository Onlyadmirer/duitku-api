import Elysia, { t } from "elysia";
import { authGuard } from "../plugin/authGuard";
import { Category } from "./service";
import { categoryCreate, categoryList, categoryUpdate } from "./model";

export const categoryModules = new Elysia({ prefix: "/categories" })
  .use(authGuard)
  .get("/", async ({ userId, query }) => {
    const listCat = await Category.list(userId, query)

    return {
      success: true,
      data: listCat
    }
  }, {
    query: categoryList
  })
  .get("/:id", async ({ userId, params: { id } }) => {
    const result = await Category.getOne(userId, id)
    return {
      success: true,
      data: result
    }
  }, {
    params: t.Object({
      id: t.String({ format: "uuid" })
    }),
  })
  .post("/", async ({ userId, body, set }) => {
    await Category.create(userId, body)

    set.status = 201
    return {
      success: true,
      message: "successfully create category"
    }
  }, { body: categoryCreate })
  .patch("/:id", async ({ userId, params: { id }, body }) => {
    const update = await Category.update(userId, id, body)

    return update
  }, {
    params: t.Object({
      id: t.String({ format: "uuid" })
    }),
    body: categoryUpdate
  })
  .delete("/:id", async ({ userId, params: { id } }) => {
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