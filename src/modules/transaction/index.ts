import Elysia from "elysia";
import { authGuard } from "../../plugin/authGuard";
import { Transaction } from "./service";
import { createTransaction, getOneTransaction } from "./model";

export const transactionModules = new Elysia({ prefix: "/transactions" }).use(authGuard)
  .post('/', async ({ body, userId }) => {
    const createTransaction = Transaction.create(userId, body)

    return createTransaction
  }, {
    body: createTransaction
  })
  .get("/id", async ({ userId, params: { id } }) => {
    const transaction = Transaction.getOne(userId, id)

    return {
      status: true,
      data: transaction
    }
  }, {
    params: getOneTransaction
  })