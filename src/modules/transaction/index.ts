import Elysia from "elysia";
import { authGuard } from "../../plugin/authGuard";
import { Transaction } from "./service";
import { createTransaction } from "./model";

export const transactionModules = new Elysia({ prefix: "/transactions" }).use(authGuard)
  .post('/', async ({ body, userId }) => {
    const transaction = Transaction.create(userId, body)

    return transaction
  }, {
    body: createTransaction
  })