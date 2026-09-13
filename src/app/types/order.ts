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

export interface OrderLineForm {
  productId: string
  quantity: string
}
