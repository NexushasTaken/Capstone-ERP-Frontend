import type { WarehouseSortBy, WarehouseSortOption } from "@/types/warehouse"

export const ITEMS_PER_PAGE = 10

export const warehouseSortOptions: WarehouseSortOption[] = [
  { label: "Latest added", value: "createdAt", order: "desc" },
  { label: "Id", value: "id", order: "asc" },
  { label: "Name (A to Z)", value: "name", order: "asc" },
  { label: "Name (Z to A)", value: "name", order: "desc" },
]

export function formatWarehouseId(warehouseId: string | number) {
  return `WH-${warehouseId}`
}

// The backend's `filter` sort code for GET /api/Inventory/warehouse/all.
export function getWarehouseFilter(sortBy: WarehouseSortBy, sortOrder: "asc" | "desc") {
  switch (sortBy) {
    case "id":
      return 1
    case "name":
      return sortOrder === "asc" ? 2 : 3
    default:
      return 0
  }
}
