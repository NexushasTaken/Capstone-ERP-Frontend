import type { Discount, DiscountType, OrderGroup } from "@/types/order"
import type { ProductListItem } from "@/types/product"

export function formatOrderNumber(orderId: number) {
  return `ORD-${orderId}`
}

export function getOrderGroupKey(group: OrderGroup) {
  return String(group.orderId)
}

export function getOrderGroupProductSummary(group: OrderGroup) {
  if (group.orders.length === 0) return "Unknown"
  if (group.orders.length === 1) return group.orders[0].productName

  return `${group.orders[0].productName} + ${group.orders.length - 1} more`
}

export function normalizeOrderText(value: string | null | undefined) {
  if (!value) return "-"
  return value.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim()
}

export function orderStatusClass(status: string | null | undefined) {
  const normalized = (status ?? "").toLowerCase()

  if (normalized.includes("ship") || normalized.includes("complete")) return "text-green-700"
  if (normalized.includes("cancel")) return "text-destructive"
  if (normalized.includes("pending") || normalized.includes("process")) return "text-amber-700"

  return "text-muted-foreground"
}

export function orderStatusDotClass(status: string | null | undefined) {
  const normalized = (status ?? "").toLowerCase()

  if (normalized.includes("ship") || normalized.includes("complete")) return "bg-green-600"
  if (normalized.includes("cancel")) return "bg-destructive"
  if (normalized.includes("pending") || normalized.includes("process")) return "bg-amber-500"

  return "bg-muted-foreground"
}

// Line values come straight from the form, so an untouched quantity can be NaN.
export function getOrderLineRows(orderLines: { productId?: number; quantity?: number }[], products: ProductListItem[]) {
  return orderLines.map((line) => {
    const product = products.find((item) => item.id === line.productId) ?? null
    const quantity = Number(line.quantity) || 0
    const unitPrice = product?.price ?? 0

    return {
      ...line,
      product,
      quantity,
      unitPrice,
      subtotal: unitPrice * quantity,
    }
  })
}

export function getOrderLineQuantityTotal(orderLines: ReturnType<typeof getOrderLineRows>) {
  return orderLines.reduce((total, line) => total + line.quantity, 0)
}

export function getOrderLineAmountTotal(orderLines: ReturnType<typeof getOrderLineRows>) {
  return orderLines.reduce((total, line) => total + line.subtotal, 0)
}

// Stock left per product after this order's lines. `heldQuantities` is what the order already took from stock
// (edit only); it counts as available again. A preview only: the server re-checks stock when the order is saved.
export function getStockLeft(
  orderLines: ReturnType<typeof getOrderLineRows>,
  heldQuantities: Record<number, number> = {},
) {
  const entered: Record<number, number> = {}
  for (const line of orderLines) {
    if (line.productId) entered[line.productId] = (entered[line.productId] ?? 0) + line.quantity
  }
  return (product: ProductListItem) =>
    (product.stock ?? 0) + (heldQuantities[product.id] ?? 0) - (entered[product.id] ?? 0)
}

export function hasStockShortage(
  orderLines: ReturnType<typeof getOrderLineRows>,
  heldQuantities?: Record<number, number>,
) {
  const stockLeft = getStockLeft(orderLines, heldQuantities)
  return orderLines.some((line) => line.product && stockLeft(line.product) < 0)
}

// Mirrors the backend's OrderMath.DiscountAmount: the percent of the subtotal, rounded to centavos.
export function getOrderDiscountAmount(subtotal: number, discountPercent?: number) {
  const percent = Number(discountPercent) || 0
  return Math.round(subtotal * percent) / 100
}

// Id of the "custom" row in the Discounts table; mirrors the backend's DiscountTypeEnum.Custom.
export const CUSTOM_DISCOUNT_ID = 5

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  none: "No discount",
  senior: "Senior citizen",
  pwd: "PWD",
  solo_parent: "Solo parent",
  custom: "Custom",
}

// Senior, PWD and solo parent have fixed rates from Philippine law (RA 9994, RA 10754, RA 11861).
export function isPresetDiscount(type?: DiscountType) {
  return type === "senior" || type === "pwd" || type === "solo_parent"
}

// A Discounts row as a dropdown choice: "Senior citizen (20%)", or just "Custom".
export function formatDiscountOption(discount: Discount) {
  const label = DISCOUNT_TYPE_LABELS[discount.type] ?? discount.type
  return isPresetDiscount(discount.type) ? `${label} (${discount.percent}%)` : label
}

// "Senior citizen, 20%" for presets, just "15%" for custom ones.
export function formatDiscount(type: DiscountType | undefined, discountPercent?: number) {
  const percent = `${Number(discountPercent) || 0}%`
  return type && isPresetDiscount(type) ? `${DISCOUNT_TYPE_LABELS[type]}, ${percent}` : percent
}
