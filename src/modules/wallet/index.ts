import Elysia from "elysia";
import { authGuard } from "../../plugin/authGuard";
import { Wallet } from "./service";
import { createWallet } from "./model";

export const walletModules = new Elysia({ prefix: "/wallets" }).use(authGuard)
  .post("/", async ({ userId, body, set }) => {
    const newWallet = await Wallet.create(userId, body)

    set.status = 201
    return {
      success: true,
      data: newWallet
    }
  }, {
    body: createWallet
  })