import type { WarehouseCapacity } from "@/types/inventory"
import type { WarehouseListItem } from "@/types/warehouseCapacity"

export const MAX_SELECTED_WAREHOUSES = 3

export function toWarehouseCapacity(warehouse: WarehouseListItem): WarehouseCapacity {
  return {
    warehouse: warehouse.name,
    used: warehouse.stocks,
    total: warehouse.capacity,
  }
}

export function getTotalWarehouseCapacity(warehouses: WarehouseListItem[]): WarehouseCapacity {
  return {
    warehouse: "Total capacity",
    used: warehouses.reduce((total, warehouse) => total + warehouse.stocks, 0),
    total: warehouses.reduce((total, warehouse) => total + warehouse.capacity, 0),
  }
}

export function toggleSelectedWarehouseId(selectedWarehouseIds: number[], warehouseId: number) {
  if (selectedWarehouseIds.includes(warehouseId)) {
    return selectedWarehouseIds.filter((id) => id !== warehouseId)
  }
  if (selectedWarehouseIds.length >= MAX_SELECTED_WAREHOUSES) {
    return selectedWarehouseIds
  }
  return [...selectedWarehouseIds, warehouseId]
}
