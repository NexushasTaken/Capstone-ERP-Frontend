import type { WarehouseCapacity } from '@/app/types/inventory'

export interface WarehouseCapacityRecord {
  id: string
  warehouseName: string
  address: string
  maximumCapacity: number
  usedCapacity: number
}

export interface WarehouseCapacityFormState {
  warehouseName: string
  address: string
  maximumCapacity: string
}

export interface StoredWarehouseCapacityState {
  warehouses: WarehouseCapacityRecord[]
  selectedWarehouseIds: string[]
}

export interface WarehouseCapacitySectionProps {
  initialCapacity: WarehouseCapacity
}
