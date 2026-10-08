import Elysia, { t } from "elysia";
import { authGuard } from "../../plugin/authGuard";
import { Transaction } from "./service";
import { createTransaction, getOneTransaction, transactionQuery, updateTransaction } from "./model";

export const transactionModules = new Elysia({ prefix: "/transactions" }).use(authGuard)
  .post('/', async ({ body, userId }) => {
    const createTransaction = await Transaction.create(userId, body)

    return createTransaction
  }, {
    body: createTransaction
  })
  .get("/", async ({ userId, query }) => {
    const transactionList = await Transaction.list(userId,
      {
        ...query,
        page: Number(query.page ?? 1),
        limit: Number(query.limit ?? 20)
      })

    return {
      success: true,
      data: transactionList
    }
  }, {
    query: transactionQuery
  })
  .get("/:id", async ({ userId, params: { id } }) => {
    const transaction = await Transaction.getOne(userId, id)

    return {
      status: true,
      data: transaction
    }
  }, {
    params: getOneTransaction
  })
  .patch("/:id", async ({ userId, params: { id }, body }) => {
    const updatedTransaction = await Transaction.updateTransaction(userId, id, body)

    return {
      success: true,
      data: updatedTransaction
    }
  }, {
    params: t.Object({
      id: t.String({ format: "uuid" })
    }),
    body: updateTransaction
  })
  .delete("/:id", async ({ userId, params: { id } }) => {
    await Transaction.delete(userId, id)

    return {
      success: true,
      message: "successfully delete transaction"
    }

  }, {
    params: t.Object({
      id: t.String({ format: "uuid" })
    })
  })