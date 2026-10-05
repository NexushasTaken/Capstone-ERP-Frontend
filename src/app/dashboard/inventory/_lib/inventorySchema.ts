import { z } from "zod"
import { positiveInt, requiredId, requiredNumber, requiredString } from "@/lib/validation"

export interface InventoryFields {
  name: string
  productId: number
  warehouseId: number
  reorderPoint: number
  /** Only asked for when adding. */
  quantity?: number
  /** Only asked for when adding, as `yyyy-MM-dd`. */
  dateArrived?: string
}

// Adding also asks for quantity and arrival date, and (like the backend) needs a reorder point above 0.
export function inventorySchema(isEdit: boolean): z.ZodType<InventoryFields, InventoryFields> {
  const common = {
    name: requiredString("Name is required."),
    productId: requiredId("Select a product."),
    warehouseId: requiredId("Select a warehouse."),
  }
  if (isEdit) {
    return z.object({
      ...common,
      reorderPoint: requiredNumber("Reorder point is required.").int().min(0, "Reorder point can't be negative."),
      quantity: z.number().optional(),
      dateArrived: z.string().optional(),
    })
  }
  return z.object({
    ...common,
    reorderPoint: positiveInt("Reorder point must be greater than 0."),
    quantity: positiveInt("Quantity must be greater than 0."),
    dateArrived: requiredString("Pick the arrival date."),
  })
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
