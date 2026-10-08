export interface InventoryListItem {
  id: number
  productId: number
  /** The product's name; an item is one product stocked in one warehouse. */
  name: string
  quantity: number
  reorderPoint: number
  warehouseId: number
  warehouseName: string
  status: string
  categoryName: string
}

export type InventoryFilter = "All" | string

export type InventorySortBy = "latest" | "name" | "quantity" | "reorderPoint" | "warehouseId"

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
  /** 0 or undefined: any warehouse. */
  warehouseId?: number
  /** 0 or undefined: any category. */
  categoryId?: number
  minQuantity?: number
  maxQuantity?: number
}

export interface InsertInventoryPayload {
  quantity: number
  productId: number
  warehouseId: number
  reorderPoint: number
}

// Only the reorder point can change; product and warehouse are fixed.
export interface UpdateInventoryPayload {
  id: number
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
