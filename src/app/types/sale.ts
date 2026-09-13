export interface SaleLine {
  productName: string
  quantity: number
  price: number
  totalAmount: number
}

export interface Sale {
  id: number
  orderType: string
  orderStatus: string
  driverName: string
  customerName: string
  pickUpAddress: string
  deliveryAddress: string
  orders: SaleLine[]
  total: number
  created_At: string
}

export type SalesSortBy = 'name' | 'quantity'
