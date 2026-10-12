import Elysia, { t } from "elysia";
import { authGuard } from "../../plugin/authGuard";
import { Transaction } from "./service";
import { createTransaction, getOneTransaction, transactionQuery, updateTransaction } from "./model";

export const transactionModules = new Elysia({
  prefix: "/transactions",
  detail: {
    tags: ["Transaction"],
  }
}).use(authGuard)
  .post('/', async ({ body, userId, set }) => {
    const created = await Transaction.create(userId, body)

    set.status = 201
    return {
      success: true,
      data: created
    }
  }, {
    body: createTransaction
  })
  .get("/", async ({ userId, query }) => {
    const transactionList = await Transaction.list(userId, query)

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
      success: true,
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