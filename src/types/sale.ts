import type { DiscountType } from "./order"

/** One product of a sale (its order lines added up). */
export interface SaleLine {
  productId: number
  productName: string
  unit: string | null
  quantity: number
  price: number
  totalAmount: number
  /** Units of it customers have brought back so far. */
  returnedQuantity: number
  /** Price per unit when it sold, before the order discount. */
  soldUnitPrice: number
}

export interface Sale {
  id: number
  orderType: string
  orderStatus: string
  driverName: string
  customerName: string
  deliveryAddress: string
  orders: SaleLine[]
  subtotal: number
  discountPercent: number
  discountId: number
  discountType: DiscountType
  discountAmount: number
  /** Net of the discount. */
  total: number
  /** Money given back on this sale's returns. */
  refunded: number
  totalAfterRefunds: number
  /** When the order was completed. */
  created_At: string
}

export type ReturnCondition = "good" | "damaged"

/** One product brought back from a sale. */
export interface SaleReturn {
  id: number
  saleId: number
  productName: string
  customerName: string
  unit: string | null
  quantity: number
  condition: ReturnCondition
  refund: number
  reason: string
  processedBy: string | null
  /** When the return was recorded. */
  created_At: string
}

export type SaleSortBy = "date" | "total" | "customer"

export interface SaleSortOption {
  label: string
  value: SaleSortBy
  order: "asc" | "desc"
}

/** Daily = one day, weekly = its Monday-to-Sunday week, monthly = its calendar month. */
export type SalesReportPeriod = "daily" | "weekly" | "monthly"

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
  /** Sum of every matching sale's total after refunds, not just this page. */
  totalAmount: number
}

export interface FetchSaleReturnsParams {
  page?: number
  pageSize?: number
  name?: string
  /** First and last return day, `yyyy-MM-dd` (Philippine days). */
  from?: string
  to?: string
}

export interface SaleReturnListContent {
  returns: SaleReturn[]
  pageCount: number
  rows: number
}

export interface SaleReturnPayload {
  saleId: number
  reason: string
  /** conditionId: 1 good (back to stock), 2 damaged. */
  items: { productId: number; quantity: number; conditionId: 1 | 2 }[]
}

/** First and last day with a sale, `yyyy-MM-dd` (Philippine days); null when there are no sales. */
export interface SaleDateRange {
  first: string | null
  last: string | null
}
