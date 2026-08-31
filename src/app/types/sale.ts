export type SaleStatus = 'Paid' | 'Processing' | 'Delivered' | 'Refunded'

export interface Sale {
  id: string
  orderId: string
  totalAmount: number
  createdBy: string
  createdAt: string
  updatedBy: string | null
  updatedAt: string | null
  deletedBy: string | null
  deletedAt: string | null
  isActive: boolean
}

