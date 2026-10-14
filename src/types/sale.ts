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
  /** When the order was completed. */
  created_At: string
}

export type SaleSortBy = "date" | "total" | "customer"

export interface SaleSortOption {
  label: string
  value: SaleSortBy
  order: "asc" | "desc"
}

// API request/response shapes

export interface FetchSalesParams {
  page?: number
  pageSize?: number
  name?: string
  orderTypeId?: number
  /** Backend sort code, see `getSaleFilter`. */
  filter?: number
  /** First and last day to include, `yyyy-MM-dd` (Philippine days). */
  from?: string
  to?: string
}

export interface SaleListContent {
  sales: Sale[]
  pageCount: number
  rows: number
  /** Sum of every matching sale's total, not just this page. */
  totalAmount: number
}
