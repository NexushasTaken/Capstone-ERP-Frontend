export const ORDER_STATUSES = [
  'Processing',
  'Completed',
  'Cancelled',
] as const

export const ORDER_TYPES = [
  'Deliver',
  'Walk-in',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]
export type OrderType = (typeof ORDER_TYPES)[number]

export interface PhilippineLocation {
  city: string
  province: string
  flag: string
}

export interface Order {
  id: string
  inventoryId: string
  customerName: string
  productName: string
  quantity: number
  price: number
  orderDate: string
  orderType: OrderType
  assignedTo: string
  pickupAddress: PhilippineLocation
  deliveryAddress: PhilippineLocation
  status: OrderStatus
}

export interface OrderStatusFilter {
  label: 'All' | OrderStatus
  count: number
}

export type OrdersSortBy =
  | 'orderDate'
  | 'customerName'
  | 'productName'
  | 'quantity'
  | 'price'
  | 'status'

export interface OrderSortOption {
  label: string
  value: OrdersSortBy
  order: 'asc' | 'desc'
}
