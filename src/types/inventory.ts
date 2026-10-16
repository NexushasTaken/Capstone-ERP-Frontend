export interface InventoryListItem {
  id: number
  productId: number
  /** The product's name; an item is one product's stock in the store. */
  name: string
  quantity: number
  reorderPoint: number
  status: string
  categoryName: string
}

export type InventoryFilter = "All" | string

export type InventorySortBy = "latest" | "name" | "quantity" | "reorderPoint"

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
  /** 0 or undefined: any category. */
  categoryId?: number
  minQuantity?: number
  maxQuantity?: number
}

export interface InsertInventoryPayload {
  quantity: number
  productId: number
  reorderPoint: number
}

// Only the reorder point can change; the product is fixed.
export interface UpdateInventoryPayload {
  id: number
  reorderPoint: number
}

export interface MarkInventoryAsDamagePayload {
  id: number
  quantity: number
  reason: string
  created_At: string
}

export interface RestockInventoryPayload {
  id: number
  quantity: number
}
