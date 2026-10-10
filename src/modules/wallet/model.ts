import { Static, t } from "elysia";

export const createWallet = t.Object({
  name: t.String({ minLength: 1, maxLength: 50 }),
  initialBalance: t.Optional(t.Integer({ minimum: 0, default: 0 })),
})

export type createWalletType = Static<typeof createWallet>