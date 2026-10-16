import { z } from "zod"
import { positiveInt, requiredId, requiredString } from "@/lib/validation"

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

export const restockSchema = z.object({
  quantity: positiveInt("Quantity must be a whole number greater than 0."),
})

export type RestockFormValues = z.infer<typeof restockSchema>

// Damage comes out of stock, so it can't exceed what's on hand.
export function damageSchema(available: number) {
  return z.object({
    quantity: positiveInt("Quantity must be a whole number greater than 0.").max(
      available,
      `Only ${available} available.`,
    ),
    reason: requiredString("Add a reason for marking it as damaged."),
  })
}

export type DamageFormValues = z.infer<ReturnType<typeof damageSchema>>
