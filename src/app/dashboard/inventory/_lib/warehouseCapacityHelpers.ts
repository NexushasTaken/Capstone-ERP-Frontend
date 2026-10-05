import type {
  StoredWarehouseCapacityState,
  WarehouseCapacityFormState,
  WarehouseCapacityRecord,
} from '@/types/warehouseCapacity'
import type { WarehouseCapacity } from '@/types/inventory'

export const WAREHOUSE_CAPACITY_STORAGE_KEY = 'erp.warehouseCapacity'
export const MAX_SELECTED_WAREHOUSES = 3

export const emptyWarehouseCapacityForm: WarehouseCapacityFormState = {
  warehouseName: '',
  address: '',
  maximumCapacity: '',
}

export function createWarehouseCapacityRecord(
  form: WarehouseCapacityFormState
): WarehouseCapacityRecord {
  return {
    id: `warehouse-${Date.now()}`,
    warehouseName: form.warehouseName.trim(),
    address: form.address.trim(),
    maximumCapacity: Number(form.maximumCapacity),
    usedCapacity: 0,
  }
}

export function toWarehouseCapacity(
  warehouse: WarehouseCapacityRecord
): WarehouseCapacity {
  return {
    warehouse: warehouse.warehouseName,
    used: warehouse.usedCapacity,
    total: warehouse.maximumCapacity,
  }
}

export function getTotalWarehouseCapacity(
  warehouses: WarehouseCapacityRecord[]
): WarehouseCapacity {
  return {
    warehouse: 'Total capacity',
    used: warehouses.reduce(
      (total, warehouse) => total + warehouse.usedCapacity,
      0
    ),
    total: warehouses.reduce(
      (total, warehouse) => total + warehouse.maximumCapacity,
      0
    ),
  }
}

export function canAddWarehouseCapacity(
  form: WarehouseCapacityFormState
) {
  return (
    form.warehouseName.trim() !== '' &&
    form.address.trim() !== '' &&
    Number(form.maximumCapacity) > 0
  )
}

export function parseStoredWarehouseCapacity(
  value: string | null,
  fallback: StoredWarehouseCapacityState
): StoredWarehouseCapacityState {
  if (!value) return fallback

  try {
    const parsed = JSON.parse(value) as StoredWarehouseCapacityState
    const warehouses = Array.isArray(parsed.warehouses)
      ? parsed.warehouses.filter(
          (warehouse) =>
            typeof warehouse.id === 'string' &&
            typeof warehouse.warehouseName === 'string' &&
            typeof warehouse.address === 'string' &&
            Number.isFinite(warehouse.maximumCapacity) &&
            Number.isFinite(warehouse.usedCapacity)
        )
      : fallback.warehouses

    const selectedWarehouseIds = Array.isArray(parsed.selectedWarehouseIds)
      ? parsed.selectedWarehouseIds
          .filter((id) =>
            warehouses.some((warehouse) => warehouse.id === id)
          )
          .slice(0, MAX_SELECTED_WAREHOUSES)
      : fallback.selectedWarehouseIds

    return {
      warehouses,
      selectedWarehouseIds,
    }
  } catch {
    return fallback
  }
}

export function serializeWarehouseCapacity(
  state: StoredWarehouseCapacityState
) {
  return JSON.stringify(state)
}

export function toggleSelectedWarehouseId(
  selectedWarehouseIds: string[],
  warehouseId: string
) {
  if (selectedWarehouseIds.includes(warehouseId)) {
    return selectedWarehouseIds.filter((id) => id !== warehouseId)
  }

  if (selectedWarehouseIds.length >= MAX_SELECTED_WAREHOUSES) {
    return selectedWarehouseIds
  }

  return [...selectedWarehouseIds, warehouseId]
}
