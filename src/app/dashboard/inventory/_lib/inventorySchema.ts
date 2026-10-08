import { z } from "zod"
import { positiveInt, requiredId, requiredString } from "@/lib/validation"

export interface InventoryFields {
  productId: number
  warehouseId: number
  reorderPoint: number
  /** Only asked for when adding. */
  quantity?: number
}

// An item is one product in one warehouse. Editing only changes the reorder point; like the backend, it must be above 0.
export function inventorySchema(isEdit: boolean): z.ZodType<InventoryFields, InventoryFields> {
  const common = {
    productId: requiredId("Select a product."),
    warehouseId: requiredId("Select a warehouse."),
    reorderPoint: positiveInt("Reorder point must be greater than 0."),
  }
  if (isEdit) {
    return z.object({ ...common, quantity: z.number().optional() })
  }
  return z.object({ ...common, quantity: positiveInt("Quantity must be greater than 0.") })
}

export const restockSchema = z.object({
  restockType: z.union([z.literal(1), z.literal(2)]),
  quantity: positiveInt("Quantity must be a whole number greater than 0."),
})

export type RestockFormValues = z.infer<typeof restockSchema>

// "Current item" damage (type 1) can't exceed what's in stock.
export function damageSchema(available: number) {
  return z
    .object({
      damagedType: z.union([z.literal(1), z.literal(2)]),
      quantity: positiveInt("Quantity must be a whole number greater than 0."),
      reason: requiredString("Add a reason for marking it as damaged."),
    })
    .refine((form) => form.damagedType === 2 || form.quantity <= available, {
      path: ["quantity"],
      message: `Only ${available} available.`,
    })
}

export type DamageFormValues = z.infer<ReturnType<typeof damageSchema>>
