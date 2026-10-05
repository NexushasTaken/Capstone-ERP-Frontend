export interface WarehouseListItem {
  id: number
  name: string
  address: string
  /** Number of active inventory items assigned to the warehouse. */
  stocks: number
  created_At: string
}

export type WarehouseSortBy = "id" | "createdAt" | "name"

export interface WarehouseSortOption {
  label: string
  value: WarehouseSortBy
  order: "asc" | "desc"
}

// API request/response shapes

export interface RawWarehouse {
  id: number
  name: string
  address: string
  stocks: number
  created_At: string
}

export interface WarehouseListContent {
  warehouses: RawWarehouse[]
  pageCount: number
  rows: number
}

export interface FetchWarehousesParams {
  page?: number
  pageSize?: number
  name?: string
  /** Sort code, see getWarehouseFilter. */
  filter?: number
}

export interface InsertWarehousePayload {
  name: string
  address: string
}

export interface UpdateWarehousePayload extends InsertWarehousePayload {
  id: number
}
