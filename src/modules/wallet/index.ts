import Elysia, { t } from "elysia";
import { authGuard } from "../../plugin/authGuard";
import { Wallet } from "./service";
import { createWallet, updateWallet } from "./model";

export const walletModules = new Elysia({
  prefix: "/wallets",
  tags: ["Wallet"]
}).use(authGuard)
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
  .patch("/:id", async ({ userId, params: { id }, body }) => {
    const wallet = await Wallet.update(userId, id, body)

    return {
      success: true,
      data: wallet
    }
  }, {
    params: t.Object({
      id: t.String({ format: "uuid" })
    }),

    body: updateWallet
  })