import { Static, t } from "elysia";

export const category = t.Object({
  name: t.String(),
  type: t.Union([
    t.Literal("expense"),
    t.Literal("income")
  ]),
  color: t.String()
})
export const categoryType = t.Object({
  type: t.Union([
    t.Literal("expense"),
    t.Literal("income")
  ]),
})

export type categoryCreateInput = Static<typeof category>
export type categoryUpdateInput = Static<typeof category>
export type categoryType = Static<typeof categoryType>