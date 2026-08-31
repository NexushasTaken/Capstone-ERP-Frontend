import type { OrderGroup } from '@/app/types/order'

export interface FetchOrdersParams {
  page?: number
  pageSize?: number
  name?: string
  filter?: number
  statusId?: number
  orderTypeId?: number
}

export interface OrderListContent {
  orders: OrderGroup[]
  pageCount: number
  rows: number
}
