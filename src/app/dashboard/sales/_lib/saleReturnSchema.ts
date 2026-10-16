import { z } from "zod"
import { requiredString } from "@/lib/validation"
import type { Sale } from "@/types/sale"

// One row per product of the sale; a quantity of 0 means "not returned". The limit is what's left to return.
export function saleReturnSchema(sale: Sale) {
  return z
    .object({
      items: z.array(
        z.object({
          productId: z.number(),
          quantity: z
            .number({ error: "Enter a whole number." })
            .int("Enter a whole number.")
            .min(0, "Can't be below 0."),
          conditionId: z.union([z.literal(1), z.literal(2)]),
        }),
      ),
      reason: requiredString("Please add a reason for the return"),
    })
    .superRefine((form, ctx) => {
      form.items.forEach((item, index) => {
        const line = sale.orders.find((order) => order.productId === item.productId)
        const remaining = line ? line.quantity - line.returnedQuantity : 0
        if (item.quantity > remaining) {
          ctx.addIssue({
            code: "custom",
            path: ["items", index, "quantity"],
            message: `Only ${remaining} left to return.`,
          })
        }
      })
      if (form.items.every((item) => !(item.quantity > 0))) {
        ctx.addIssue({ code: "custom", path: ["items"], message: "Enter a quantity for at least one product." })
      }
    })
}

export type SaleReturnFormValues = z.infer<ReturnType<typeof saleReturnSchema>>

// The same share of the paid total the backend refunds: sold unit price, scaled by the order discount.
export function previewRefund(sale: Sale, items: SaleReturnFormValues["items"]) {
  if (sale.subtotal === 0) return 0
  return items.reduce((sum, item) => {
    const line = sale.orders.find((order) => order.productId === item.productId)
    if (!line || !(item.quantity > 0)) return sum
    return sum + Math.round(((line.soldUnitPrice * item.quantity * sale.total) / sale.subtotal) * 100) / 100
  }, 0)
}
