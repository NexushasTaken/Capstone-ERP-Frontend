import { z } from "zod"
import { positiveInt, requiredId, requiredNumber, requiredString } from "@/lib/validation"

export interface OrderLineFields {
  productId: number
  quantity: number
}

export interface OrderFields {
  orderTypeId: number
  deliveryRiderId: number
  customerName: string
  pickUpAddress: string
  deliveryAddress: string
  discountPercent: number
  orderLines: OrderLineFields[]
}

export const emptyOrderLine: OrderLineFields = { productId: 0, quantity: 1 }

export const emptyOrder: OrderFields = {
  orderTypeId: 0,
  deliveryRiderId: 0,
  customerName: "",
  pickUpAddress: "",
  deliveryAddress: "",
  discountPercent: 0,
  orderLines: [emptyOrderLine],
}

const orderLineSchema = z.object({
  productId: requiredId("Select a product."),
  quantity: positiveInt("Quantity must be at least 1."),
})

// Walk-in orders have no rider and no addresses.
function orderObject(isWalkin: boolean) {
  return z.object({
    orderTypeId: requiredId("Select an order type."),
    customerName: requiredString("Customer name is required."),
    discountPercent: requiredNumber("Discount must be a number.")
      .min(0, "Discount can't be negative.")
      .max(100, "Discount can't be more than 100%."),
    orderLines: z.array(orderLineSchema).min(1, "Add at least one product."),
    ...(isWalkin
      ? { deliveryRiderId: z.number(), pickUpAddress: z.string(), deliveryAddress: z.string() }
      : {
          deliveryRiderId: requiredId("Select a delivery rider."),
          pickUpAddress: requiredString("Pick up address is required."),
          deliveryAddress: requiredString("Delivery address is required."),
        }),
  })
}

export function orderSchema(isWalkin: boolean): z.ZodType<OrderFields, OrderFields> {
  return orderObject(isWalkin)
}

// Editing can't change the order type or the customer, so they aren't checked.
export function editOrderSchema(isWalkin: boolean): z.ZodType<OrderFields, OrderFields> {
  return orderObject(isWalkin).extend({ orderTypeId: z.number(), customerName: z.string() })
}
