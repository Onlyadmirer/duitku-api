import { Static, t } from "elysia";

export const categoryCreate = t.Object({
  name: t.String(),
  type: t.Union([
    t.Literal("expense"),
    t.Literal("income")
  ]),
  color: t.String()
})


export const categoryList = t.Object({
  type: t.Optional(t.Union([
    t.Literal("expense"),
    t.Literal("income")
  ])),
})

export const categoryUpdate = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
  color: t.Optional(t.String({ pattern: '^#[0-9a-fA-F]{6}$' })),
}, { minProperties: 1 })


export const categoryType = t.Object({
  type: t.Union([
    t.Literal("expense"),
    t.Literal("income")
  ]),
})

export type categoryCreateInput = Static<typeof categoryCreate>
export type categoryUpdateInput = Static<typeof categoryUpdate>
export type categoryType = Static<typeof categoryType>
export type categoryList = Static<typeof categoryList>