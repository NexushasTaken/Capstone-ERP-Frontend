import { z } from "zod"
import { positiveInt, requiredId, requiredNumber, requiredString } from "@/lib/validation"
import type { Purchase } from "@/types/purchase"
import { todayIso } from "./purchaseHelpers"

export interface PurchaseLineFields {
  productId: number
  quantity: number
  unitCost: number
}

export interface PurchaseFields {
  supplierName: string
  /** "yyyy-MM-dd" */
  orderedOn: string
  note: string
  lines: PurchaseLineFields[]
}

export const emptyPurchaseLine = { productId: 0, quantity: 1 } as PurchaseLineFields

// Same rules as the backend's PurchasePostValidator.
export const purchaseSchema = z.object({
  supplierName: z.string().trim().max(100, "Supplier name can be at most 100 characters."),
  orderedOn: requiredString("Pick the order date.").refine(
    (day) => day <= todayIso(),
    "Order date can't be in the future.",
  ),
  note: z.string().trim().max(500, "Note can be at most 500 characters."),
  lines: z
    .array(
      z.object({
        productId: requiredId("Select a product."),
        quantity: positiveInt("Quantity must be at least 1."),
        unitCost: requiredNumber("Unit cost is required.").min(0, "Unit cost can't be negative."),
      }),
    )
    .min(1, "Add at least one product.")
    .refine(
      (lines) => new Set(lines.map((line) => line.productId)).size === lines.length,
      "Each product can only be on one line.",
    ),
}) satisfies z.ZodType<PurchaseFields, PurchaseFields>

export type PurchaseFormValues = z.infer<typeof purchaseSchema>

// What arrived per line: 0 up to the ordered quantity, and something must have arrived.
export function receiveSchema(purchase: Purchase) {
  return z.object({
    lines: z
      .array(z.object({ quantity: requiredNumber("Enter how many arrived.").int("Use a whole number.") }))
      .superRefine((lines, ctx) => {
        lines.forEach((line, index) => {
          const ordered = purchase.lines[index]?.quantity ?? 0
          if (line.quantity < 0) {
            ctx.addIssue({ code: "custom", path: [index, "quantity"], message: "Can't be negative." })
          } else if (line.quantity > ordered) {
            ctx.addIssue({ code: "custom", path: [index, "quantity"], message: `Only ${ordered} were ordered.` })
          }
        })
        if (lines.every((line) => !(line.quantity > 0))) {
          ctx.addIssue({ code: "custom", message: "Nothing arrived? Cancel the purchase instead." })
        }
      }),
  })
}

export type ReceiveFormValues = z.infer<ReturnType<typeof receiveSchema>>
