export const ORDER_STATUSES = ['Processing', 'Completed', 'Cancelled'] as const
export const ORDER_TYPES = ['Deliver', 'Walk-in'] as const

export type OrderStatusLabel = (typeof ORDER_STATUSES)[number]
export type OrderTypeLabel = (typeof ORDER_TYPES)[number]

export interface OrderStatus {
  id: string
  status: OrderStatusLabel
  createdBy: string
  createdAt: string
  updatedBy: string | null
  updatedAt: string | null
  deletedBy: string | null
  deletedAt: string | null
  isActive: boolean
}

export interface OrderType {
  id: string
  type: OrderTypeLabel
  createdBy: string
  createdAt: string
  updatedBy: string | null
  updatedAt: string | null
  deletedBy: string | null
  deletedAt: string | null
  isActive: boolean
}

export interface DeliveryDriver {
  id: string
  firstName: string
  lastName: string
  createdBy: string
  createdAt: string
  updatedBy: string | null
  updatedAt: string | null
  deletedBy: string | null
  deletedAt: string | null
  isActive: boolean
}

export interface Order {
  id: string
  productId: string
  orderTypeId: string
  orderStatusId: string
  deliveryDriverId: string | null
  quantity: number
  customerName: string
  pickupAddress: string
  deliveryAddress: string
  bundleCode: string | null
  createdBy: string
  createdAt: string
  updatedBy: string | null
  updatedAt: string | null
  deletedBy: string | null
  deletedAt: string | null
  isActive: boolean
  amount: number
}

export interface OrderStatusFilter {
  label: 'All' | OrderStatusLabel
  count: number
}

export type OrdersSortBy = 'createdAt' | 'customerName' | 'quantity' | 'amount'

export interface OrderSortOption {
  label: string
  value: OrdersSortBy
  order: 'asc' | 'desc'
}