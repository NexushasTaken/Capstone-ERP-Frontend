import { InventoryListItem } from "@/app/types/inventory"

export interface InventoryListContent {
  inventories: InventoryListItem[]
  pageCount: number
  rows: number
}

export interface FetchInventoriesParams {
  page?: number
  pageSize?: number
  searchString?: string
  filter?: number
  statusId?: number
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
