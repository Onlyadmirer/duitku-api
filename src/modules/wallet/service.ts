import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { wallets } from "../../db/schema";
import { createWalletType, updateWalletType } from "./model";
import { AppError } from "../../lib/error";

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
  },

  async update(userId: string, id: string, data: updateWalletType) {
    const [updateWallet] = await db.update(wallets).set({
      name: data.name,
      initialBalance: data.initialBalance
    }).where(and(
      eq(wallets.userId, userId),
      eq(wallets.id, id)
    )).returning({
      id: wallets.id,
      name: wallets.name,
      initialBalance: wallets.initialBalance
    })

    if (!updateWallet) {
      throw new AppError(404, "NOT_FOUND", "Wallet not found")
    }

    return updateWallet
  }

}