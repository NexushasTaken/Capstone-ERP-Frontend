import { format } from "date-fns"
import type { SortOption } from "@/components/SortPopover"
import type { PurchaseSortBy, PurchaseStatus } from "@/types/purchase"

export function formatPurchaseId(purchaseId: number) {
  return `PO-${purchaseId}`
}

export function formatSupplier(supplierName: string | null) {
  return supplierName ?? "No supplier"
}

/** "Oct 2, 2026" from a "yyyy-MM-dd" day. */
export function formatDay(day: string) {
  return format(new Date(day + "T00:00:00"), "MMM d, yyyy")
}

export function todayIso() {
  return format(new Date(), "yyyy-MM-dd")
}

export const purchaseStatusIds: Record<string, number> = { All: 0, ordered: 1, received: 2, cancelled: 3 }

export const purchaseStatusStyles: Record<PurchaseStatus, { label: string; className: string; dotClassName: string }> =
  {
    ordered: { label: "Ordered", className: "text-amber-700", dotClassName: "bg-amber-500" },
    received: { label: "Received", className: "text-green-700", dotClassName: "bg-green-600" },
    cancelled: { label: "Cancelled", className: "text-muted-foreground", dotClassName: "bg-muted-foreground" },
  }

export const purchaseSortOptions: SortOption<PurchaseSortBy>[] = [
  { label: "Order date (newest first)", value: "orderedOn", order: "desc" },
  { label: "Order date (oldest first)", value: "orderedOn", order: "asc" },
]
