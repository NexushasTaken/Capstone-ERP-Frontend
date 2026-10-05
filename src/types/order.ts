export interface OrderLine {
  productName: string
  quantity: number
  price: number
  totalAmount: number
}

export interface OrderGroup {
  orderId: number
  orderType: string
  orderStatus: string | null
  driverName: string | null
  customerName: string
  pickUpAddress: string | null
  deliveryAddress: string | null
  created_At: string
  orders: OrderLine[]
  total: number
}

export interface OrderType {
  id: number
  type: string
}

export interface OrderStatus {
  id: number
  status: string
}

export interface OrderRider {
  id: number
  firstName: string
  lastName: string
}

// API request/response shapes

export interface FetchOrdersParams {
  page?: number
  pageSize?: number
  name?: string
  orderTypeId?: number
  statusId?: number
}

export interface OrderListContent {
  orders: OrderGroup[]
  pageCount: number
  rows: number
}

export interface InsertOrderPayload {
  orderTypeId: number
  deliveryRiderId: number
  customerName: string
  pickUpAddress: string
  deliveryAddress: string
  orderLines: { productId: number; quantity: number }[]
}

export interface UpdateOrderStatusPayload {
  orderId: number
  orderStatusId: number
}
