import type { OrderGroup } from "@/types/order"
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

export function getOrderLineRows(orderLines: { productId: string; quantity: string }[], products: ProductListItem[]) {
  return orderLines.map((line) => {
    const product = products.find((item) => item.id === Number(line.productId)) ?? null
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
