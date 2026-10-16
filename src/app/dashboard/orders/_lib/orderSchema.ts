import { z } from "zod"
import { CUSTOM_DISCOUNT_ID } from "@/lib/helpers/orderHelpers"
import { positiveInt, requiredId, requiredNumber, requiredString } from "@/lib/validation"

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
  discountId: number
  orderLines: OrderLineFields[]
}

export const emptyOrderLine: OrderLineFields = { productId: 0, quantity: 1 }

export const emptyOrder: OrderFields = {
  orderTypeId: 0,
  deliveryDriverId: 0,
  customerName: "",
  deliveryAddress: "",
  discountPercent: 0,
  discountId: 1,
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
    discountId: requiredId("Select a discount."),
    orderLines: z.array(orderLineSchema).min(1, "Add at least one product."),
    ...(isWalkin
      ? { deliveryDriverId: z.number(), deliveryAddress: z.string() }
      : {
          deliveryDriverId: requiredId("Select a delivery driver."),
          deliveryAddress: requiredString("Delivery address is required."),
        }),
  })
}

// Preset rates are filled in from the Discounts table (and copied again by the backend), so only a typed
// custom rate needs checking. Who may pick custom is a role rule, handled in DiscountFields.
function checkDiscount(order: Pick<OrderFields, "discountId" | "discountPercent">, ctx: z.RefinementCtx) {
  if (order.discountId === CUSTOM_DISCOUNT_ID && order.discountPercent <= 0) {
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
