import { db } from "../../db";
import { wallets } from "../../db/schema";
import { createWalletType } from "./model";

export const Wallet = {
  async create(userId: string, data: createWalletType) {
    const [newWallet] = await db.insert(wallets).values({
      userId,
      name: data.name,
      initialBalance: data.initialBalance,
    }).returning()

    if (!newWallet) {
      throw new Error("Failed to create Wallet")
    }

    return newWallet
  }

}