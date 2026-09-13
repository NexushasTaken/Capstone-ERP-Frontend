import type { Sale } from '@/app/types/sale'

export interface FetchSalesParams {
  page?: number
  pageSize?: number
  name?: string
  filter?: number
  orderTypeId?: number
}

export interface SaleListContent {
  sales: Sale[]
  pageCount: number
  rows: number
}
