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
  subtotal: number
  discountPercent: number
  discountAmount: number
  /** Net of the discount. */
  total: number
  created_At: string
}

// API request/response shapes

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
