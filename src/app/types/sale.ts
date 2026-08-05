import type { LucideIcon } from 'lucide-react'

export type SaleStatus = 'Paid' | 'Processing' | 'Delivered' | 'Refunded'

export interface Sale {
  id: string
  productName: string
  sku: string
  productIcon: LucideIcon
  customer: string
  quantity: number
  total: number
  saleDate: string
  status: SaleStatus
}

export interface SaleStatusFilter {
  label: SaleStatus
  count: number
}
