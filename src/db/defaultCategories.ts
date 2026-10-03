export type DefaultCategory = {
  name: string
  type: 'income' | 'expense'
  color: string
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Makanan', type: 'expense', color: '#f97316' },
  { name: 'Transportasi', type: 'expense', color: '#0ea5e9' },
  { name: 'Tagihan', type: 'expense', color: '#ef4444' },
  { name: 'Belanja', type: 'expense', color: '#ec4899' },
  { name: 'Hiburan', type: 'expense', color: '#8b5cf6' },
  { name: 'Kesehatan', type: 'expense', color: '#14b8a6' },
  { name: 'Pendidikan', type: 'expense', color: '#eab308' },
  { name: 'Lainnya', type: 'expense', color: '#64748b' },
  { name: 'Gaji', type: 'income', color: '#22c55e' },
  { name: 'Freelance', type: 'income', color: '#10b981' },
  { name: 'Bonus', type: 'income', color: '#84cc16' },
  { name: 'Lainnya', type: 'income', color: '#64748b' },
]

// Dipakai oleh seed sekarang, dan oleh endpoint register nanti.
export const defaultCategoriesFor = (userId: string) =>
  DEFAULT_CATEGORIES.map((c) => ({ ...c, userId }))
