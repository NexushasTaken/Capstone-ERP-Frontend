import { z } from "zod"
import { positiveInt, requiredId, requiredNumber } from "@/lib/validation"

export interface InventoryFields {
  productId: number
  reorderPoint: number
  /** Only asked for when adding. */
  quantity?: number
}

// An item is one product's stock record. Editing only changes the reorder point; like the backend, it must be above 0.
export function inventorySchema(isEdit: boolean): z.ZodType<InventoryFields, InventoryFields> {
  const common = {
    productId: requiredId("Select a product."),
    reorderPoint: positiveInt("Reorder point must be greater than 0."),
  }
  if (isEdit) {
    return z.object({ ...common, quantity: z.number().optional() })
  }
  return z.object({ ...common, quantity: positiveInt("Quantity must be greater than 0.") })
}

export const adjustmentReasons = [
  { value: 1, label: "Damaged", sign: -1 },
  { value: 2, label: "Lost / missing", sign: -1 },
  { value: 3, label: "Found", sign: 1 },
  { value: 4, label: "Count correction", sign: 0 },
] as const

export type AdjustmentReasonValue = (typeof adjustmentReasons)[number]["value"]

/** The signed change an adjustment makes; a count correction replaces the stock with the counted quantity. */
export function adjustmentChange(reasonId: AdjustmentReasonValue, quantity: number, available: number) {
  if (Number.isNaN(quantity)) return 0
  if (reasonId === 4) return quantity - available
  return adjustmentReasons.find((reason) => reason.value === reasonId)!.sign * quantity
}

// Same rules as the backend's StockAdjustmentValidator, plus the stock checks it makes in the service.
export function adjustSchema(available: number) {
  return z
    .object({
      reasonId: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
      quantity: requiredNumber("Quantity must be a whole number.").int("Quantity must be a whole number."),
      note: z.string().trim().max(500, "Note can be at most 500 characters."),
    })
    .superRefine(({ reasonId, quantity }, ctx) => {
      if (reasonId === 4) {
        if (quantity < 0)
          ctx.addIssue({ code: "custom", path: ["quantity"], message: "Counted quantity can't be negative." })
        else if (quantity === available)
          ctx.addIssue({
            code: "custom",
            path: ["quantity"],
            message: "That matches the stock, so there is nothing to adjust.",
          })
        return
      }
      if (quantity <= 0) {
        ctx.addIssue({ code: "custom", path: ["quantity"], message: "Quantity must be greater than 0." })
      } else if (reasonId !== 3 && quantity > available) {
        ctx.addIssue({ code: "custom", path: ["quantity"], message: `Only ${available} in stock.` })
      }
    })
}

export type AdjustFormValues = z.infer<ReturnType<typeof adjustSchema>>
