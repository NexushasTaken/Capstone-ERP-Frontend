import type { InventorySortBy } from "@/types/inventory"

export function formatInventoryId(inventoryId: string) {
  return `INV-${inventoryId}`
}

export function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "0"
  return new Intl.NumberFormat("en-US").format(value)
}

export function capitalize(value: string) {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** "low stock" -> "Low Stock". */
export function titleCase(value: string) {
  return value.replace(/(^|\s)(\S)/g, (_, space: string, letter: string) => space + letter.toUpperCase())
}

export const statusDotColors: Record<string, string> = {
  critical: "bg-destructive",
  available: "bg-green-600",
  "low stock": "bg-amber-500",
  pending: "bg-muted-foreground",
}
export const statusTextColors: Record<string, string> = {
  critical: "text-destructive",
  available: "text-green-700",
  "low stock": "text-amber-700",
  pending: "text-muted-foreground",
}

export function getInventoryStatusStyleFromLabel(status: string) {
  return {
    dotClassName: statusDotColors[status] ?? "bg-muted-foreground",
    labelClassName: statusTextColors[status] ?? "text-muted-foreground",
  }
}

export const inventorySortOptions = [
  {
    label: "Latest added",
    value: "latest" as InventorySortBy,
    order: "asc" as const,
  },
  {
    label: "Product (A to Z)",
    value: "name" as InventorySortBy,
    order: "asc" as const,
  },
  {
    label: "Product (Z to A)",
    value: "name" as InventorySortBy,
    order: "desc" as const,
  },
  {
    label: "Quantity (High to Low)",
    value: "quantity" as InventorySortBy,
    order: "desc" as const,
  },
  {
    label: "Quantity (Low to High)",
    value: "quantity" as InventorySortBy,
    order: "asc" as const,
  },
  {
    label: "Reorder point (Ascending)",
    value: "reorderPoint" as InventorySortBy,
    order: "asc" as const,
  },
  {
    label: "Warehouse ID (Ascending)",
    value: "warehouseId" as InventorySortBy,
    order: "asc" as const,
  },
]

export function getInventoryFilter(value: { value: InventorySortBy; order: "asc" | "desc" }) {
  if (value.value === "name") return value.order === "asc" ? 1 : 2
  if (value.value === "quantity") return value.order === "desc" ? 3 : 4
  if (value.value === "reorderPoint") return 5
  if (value.value === "warehouseId") return 6

  return 0
}
