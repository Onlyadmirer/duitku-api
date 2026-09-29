
import { randomBytes, createHash } from "node:crypto"

export function generateRefreshToken() {
  return randomBytes(32).toString("base64url")
}

export function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}