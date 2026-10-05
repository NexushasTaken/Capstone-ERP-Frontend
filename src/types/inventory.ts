export interface WarehouseCapacity {
  warehouse: string
  used: number
  total: number
}

export interface InventoryListItem {
  id: number
  productId: number
  name: string
  quantity: number
  reorderPoint: number
  warehouseId: number
  warehouseName: string
  status: string
  dateArrived: string
}

export type InventoryFilter = 'All' | string

export type InventorySortBy = 'latest' | 'name' | 'quantity' | 'reorderPoint' | 'warehouseId'

export interface InventoryMovementItem {
  quantity: number
  label: string
  created_At: string
}

export interface InventoryDamageItem {
  quantity: number
  reason: string
  created_At: string
}
export interface InventoryVelocityItem {
  inventoryId: number
  name: string
  warehouse: string
  classification: string
  velocityMetric: number
}

// API request/response shapes

export interface InventoryVelocityContent {
  inventories: InventoryVelocityItem[]
  pageCount: number
  rows: number
}

export interface FetchInventoryVelocityParams {
  cutOffDate: number
  page?: number
  pageSize?: number
}

export interface InventoryListContent {
  inventories: InventoryListItem[]
  pageCount: number
  rows: number
}

export interface FetchInventoriesParams {
  statusId?: number
  page?: number
  pageSize?: number
  name?: string
  filter?: number
}

export interface InsertInventoryPayload {
  name: string
  quantity: number
  productId: number
  warehouseId: number
  dateArrived: string
  reorderPoint: number
}

export interface UpdateInventoryPayload {
  id: number
  name: string
  productId: number
  warehouseId: number
  reorderPoint: number
}

export interface MarkInventoryAsDamagePayload {
  damagedType: 1 | 2
  id: number
  quantity: number
  reason: string
  created_At: string
}

export interface RestockInventoryPayload {
  id: number
  quantity: number
  restockType: 1 | 2
}
