import type { Sale } from '@/app/types/sale'

export interface FetchSalesParams {
  page?: number
  pageSize?: number
  name?: string
  orderTypeId?: number
}

export interface SaleListContent {
  sales: Sale[]
  pageCount: number
  rows: number
}
