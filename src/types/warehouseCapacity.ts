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

export interface WarehouseListItem {
  id: number
  name: string
  address: string
  stocks: number
  capacity: number
}

// API request/response shapes

export interface RawWarehouse {
  id: number
  name: string
  address: string
  stocks: number
  capicity: number
  capacity?: number
}

export interface InsertWarehousePayload {
  name: string
  address: string
  capicity: number
}

export interface UpdateWarehousePayload extends InsertWarehousePayload {
  id: number
}
