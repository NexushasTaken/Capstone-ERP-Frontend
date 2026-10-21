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

/** Values match the backend's AdjustmentReasonEnum. 5 (opening stock) is written by the system only. */
export type AdjustmentReasonId = 1 | 2 | 3 | 4 | 5

export interface InventoryAdjustmentItem {
  reasonId: AdjustmentReasonId
  reason: string
  /** Signed: + added, - taken out. */
  quantity: number
  note: string | null
  /** Set when the units came back damaged from this sale's return. */
  saleId: number | null
  created_At: string
}

// API request/response shapes

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

/** quantity: units damaged, lost or found; for a count correction, the counted quantity. */
export interface AdjustInventoryPayload {
  id: number
  reasonId: Exclude<AdjustmentReasonId, 5>
  quantity: number
  note?: string
}
