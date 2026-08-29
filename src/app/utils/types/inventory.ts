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