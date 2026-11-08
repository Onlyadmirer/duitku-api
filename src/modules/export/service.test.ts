import { describe, expect, test } from "bun:test";
import { toExportFormat } from "./service";
import type { exportSourceRows } from "./model";

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

const W1 = "11111111-1111-4111-8111-111111111111"
const W2 = "22222222-2222-4222-8222-222222222222"
const C1 = "33333333-3333-4333-8333-333333333333"
const C2 = "44444444-4444-4444-8444-444444444444"

const fixture = (): exportSourceRows => ({
  // Sengaja tidak terurut untuk menguji pengurutan deterministik.
  wallets: [
    { id: W2, name: "Bank", initialBalance: 5_000_000, createdAt: new Date("2026-10-02T00:00:00Z") },
    { id: W1, name: "Dompet Utama", initialBalance: 2_000_000, createdAt: new Date("2026-10-01T00:00:00Z") }
  ],
  categories: [
    { id: C1, name: "Makanan", type: "expense", color: "#f97316", createdAt: new Date("2026-10-01T00:00:00Z") },
    { id: C2, name: "Gaji", type: "income", color: "#22c55e", createdAt: new Date("2026-10-01T00:00:00Z") }
  ],
  transactions: [
    {
      id: "55555555-5555-4555-8555-555555555555", walletId: W2, categoryId: C2, amount: 10_000_000,
      type: "income", note: null, date: "2026-10-25", createdAt: new Date("2026-10-25T01:00:00Z")
    },
    {
      id: "66666666-6666-4666-8666-666666666666", walletId: W1, categoryId: C1, amount: 40_000,
      type: "expense", note: "Makan siang", date: "2026-10-20", createdAt: new Date("2026-10-20T05:00:00Z")
    }
  ],
  budgets: [
    {
      id: "77777777-7777-4777-8777-777777777777", categoryId: C1, month: "2026-10",
      limitAmount: 1_500_000, createdAt: new Date("2026-10-01T00:00:00Z")
    }
  ]
})

describe("toExportFormat", () => {
  test("format dan version benar", () => {
    const result = toExportFormat(fixture())
    expect(result.format).toBe("duitku-export")
    expect(result.version).toBe(1)
    expect(result.currency).toBe("IDR")
  })

  test("id integer urut mulai 1 dan tidak ada UUID", () => {
    const result = toExportFormat(fixture())
    for (const list of Object.values(result.data)) {
      list.forEach((row, i) => {
        expect(Number.isInteger(row.id)).toBe(true)
        expect(row.id).toBe(i + 1)
      })
    }
    expect(UUID_RE.test(JSON.stringify(result))).toBe(false)
  })

  test("semua referensi walletId/categoryId valid", () => {
    const { data } = toExportFormat(fixture())
    const walletIds = new Set(data.wallets.map((w) => w.id))
    const categoryIds = new Set(data.categories.map((c) => c.id))

    for (const tx of data.transactions) {
      expect(walletIds.has(tx.walletId)).toBe(true)
      expect(categoryIds.has(tx.categoryId)).toBe(true)
    }
    for (const b of data.budgets) {
      expect(categoryIds.has(b.categoryId)).toBe(true)
    }

    // Referensi diterjemahkan dengan benar (bukan sekadar ada).
    const lunch = data.transactions.find((tx) => tx.note === "Makan siang")!
    expect(data.wallets.find((w) => w.id === lunch.walletId)!.name).toBe("Dompet Utama")
    expect(data.categories.find((c) => c.id === lunch.categoryId)!.name).toBe("Makanan")
  })

  test("createdAt bertipe number (epoch ms) dan angka bertipe number", () => {
    const { data } = toExportFormat(fixture())
    for (const list of Object.values(data)) {
      for (const row of list) {
        expect(typeof row.createdAt).toBe("number")
      }
    }
    expect(data.wallets[0]!.createdAt).toBe(new Date("2026-10-01T00:00:00Z").getTime())
    expect(typeof data.wallets[0]!.initialBalance).toBe("number")
    expect(typeof data.transactions[0]!.amount).toBe("number")
    expect(typeof data.budgets[0]!.limitAmount).toBe("number")
  })

  test("urutan deterministik", () => {
    const { data } = toExportFormat(fixture())
    expect(data.wallets.map((w) => w.name)).toEqual(["Dompet Utama", "Bank"])
    // createdAt sama -> diurutkan berdasarkan id (uuid)
    expect(data.categories.map((c) => c.name)).toEqual(["Makanan", "Gaji"])
    expect(data.transactions.map((tx) => tx.date)).toEqual(["2026-10-20", "2026-10-25"])
    expect(data.transactions[1]!.note).toBeNull()
  })

  test("walletId tidak dikenal melempar error", () => {
    const rows = fixture()
    rows.transactions[0]!.walletId = "99999999-9999-4999-8999-999999999999"
    expect(() => toExportFormat(rows)).toThrow()
  })

  test("categoryId anggaran tidak dikenal melempar error", () => {
    const rows = fixture()
    rows.budgets[0]!.categoryId = "99999999-9999-4999-8999-999999999999"
    expect(() => toExportFormat(rows)).toThrow()
  })
})
