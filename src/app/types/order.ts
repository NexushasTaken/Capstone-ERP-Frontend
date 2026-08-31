export interface Order {
  id: number
  productName: string
  orderType: string
  orderStatus: string
  driverName: string
  quantity: number
  customerName: string
  pickUpAddress: string | null
  deliveryAddress: string | null
  amount: number
  bundleCode: string | null
  created_At: string
}

export interface OrderGroup {
  orders: Order[]
  total: number
}

export interface InsertOrderPayloadItem {
  productId: number
  orderTypeId: number
  deliveryRiderId: number
  quantity: number
  customerName: string
  pickUpAddress: string
  deliveryAddress: string
}

export type OrdersSortBy = 'createdAt' | 'customerName' | 'quantity' | 'amount'

export interface OrderSortOption {
  label: string
  value: OrdersSortBy
  order: 'asc' | 'desc'
}

export interface OrderLineForm {
  productId: string
  quantity: string
}
