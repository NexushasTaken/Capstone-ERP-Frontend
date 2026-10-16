import { z } from "zod"
import { DISCOUNT_PRESET_RATES, DISCOUNT_TYPE_LABELS } from "@/lib/helpers/orderHelpers"
import { positiveInt, requiredId, requiredNumber, requiredString } from "@/lib/validation"
import type { DiscountType } from "@/types/order"

export interface OrderLineFields {
  productId: number
  quantity: number
}

export interface OrderFields {
  orderTypeId: number
  deliveryDriverId: number
  customerName: string
  deliveryAddress: string
  discountPercent: number
  discountType: DiscountType
  discountIdNumber: string
  orderLines: OrderLineFields[]
}

export const emptyOrderLine: OrderLineFields = { productId: 0, quantity: 1 }

export const emptyOrder: OrderFields = {
  orderTypeId: 0,
  deliveryDriverId: 0,
  customerName: "",
  deliveryAddress: "",
  discountPercent: 0,
  discountType: "none",
  discountIdNumber: "",
  orderLines: [emptyOrderLine],
}

const orderLineSchema = z.object({
  productId: requiredId("Select a product."),
  quantity: positiveInt("Quantity must be at least 1."),
})

// Walk-in orders have no driver and no addresses.
function orderObject(isWalkin: boolean) {
  return z.object({
    orderTypeId: requiredId("Select an order type."),
    customerName: requiredString("Customer name is required."),
    discountPercent: requiredNumber("Discount must be a number.")
      .min(0, "Discount can't be negative.")
      .max(100, "Discount can't be more than 100%."),
    discountType: z.enum(["none", "senior", "pwd", "solo_parent", "custom"]),
    discountIdNumber: z.string().trim().max(50, "ID number can't be longer than 50 characters."),
    orderLines: z.array(orderLineSchema).min(1, "Add at least one product."),
    ...(isWalkin
      ? { deliveryDriverId: z.number(), deliveryAddress: z.string() }
      : {
          deliveryDriverId: requiredId("Select a delivery driver."),
          deliveryAddress: requiredString("Delivery address is required."),
        }),
  })
}

// Matches the backend's OrderDiscountValidator. Who may pick "custom" is a role rule, handled in DiscountFields.
function checkDiscount(
  order: Pick<OrderFields, "discountType" | "discountPercent" | "discountIdNumber">,
  ctx: z.RefinementCtx,
) {
  const presetRate = DISCOUNT_PRESET_RATES[order.discountType]

  if (order.discountType === "none" && order.discountPercent !== 0) {
    ctx.addIssue({ code: "custom", path: ["discountPercent"], message: "Discount must be 0 when there is none." })
  }
  if (presetRate !== undefined) {
    if (order.discountPercent !== presetRate) {
      ctx.addIssue({
        code: "custom",
        path: ["discountPercent"],
        message: `The ${DISCOUNT_TYPE_LABELS[order.discountType].toLowerCase()} discount is fixed at ${presetRate}%.`,
      })
    }
    if (!order.discountIdNumber.trim()) {
      ctx.addIssue({ code: "custom", path: ["discountIdNumber"], message: "ID number is required for this discount." })
    }
  }
  if (order.discountType === "custom" && order.discountPercent <= 0) {
    ctx.addIssue({ code: "custom", path: ["discountPercent"], message: "Custom discount must be more than 0." })
  }
}

export function orderSchema(isWalkin: boolean): z.ZodType<OrderFields, OrderFields> {
  return orderObject(isWalkin).superRefine(checkDiscount)
}

// Editing can't change the order type or the customer, so they aren't checked.
export function editOrderSchema(isWalkin: boolean): z.ZodType<OrderFields, OrderFields> {
  return orderObject(isWalkin).extend({ orderTypeId: z.number(), customerName: z.string() }).superRefine(checkDiscount)
}
