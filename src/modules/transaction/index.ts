import Elysia, { t } from "elysia";
import { authGuard } from "../../plugin/authGuard";
import { Transaction } from "./service";
import { createTransaction, getOneTransaction, updateTransaction } from "./model";

export const transactionModules = new Elysia({ prefix: "/transactions" }).use(authGuard)
  .post('/', async ({ body, userId }) => {
    const createTransaction = await Transaction.create(userId, body)

    return createTransaction
  }, {
    body: createTransaction
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