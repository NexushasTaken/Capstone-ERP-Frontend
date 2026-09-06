import type { InventoryListItem, InventoryVelocityItem } from '@/app/types/inventory'

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
