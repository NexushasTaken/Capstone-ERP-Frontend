export type PurchaseStatus = "ordered" | "received" | "cancelled"

export interface PurchaseLine {
  productId: number
  productName: string
  unit: string | null
  /** Ordered quantity. */
  quantity: number
  /** What arrived; null until received. */
  receivedQuantity: number | null
  /** What the store pays per unit. */
  unitCost: number
  /** quantity × unitCost. */
  total: number
}

export interface Purchase {
  id: number
  supplierName: string | null
  /** "yyyy-MM-dd", the day it was ordered from the supplier. */
  orderedOn: string
  note: string | null
  /** 1 ordered, 2 received, 3 cancelled. */
  statusId: 1 | 2 | 3
  status: PurchaseStatus
  lines: PurchaseLine[]
  /** Cost of what was ordered. */
  total: number
  /** Cost of what arrived; null until received. */
  receivedTotal: number | null
  created_At: string
  receivedAt: string | null
  /** Days from ordering to receiving; null until received. */
  leadTimeDays: number | null
}

export type PurchaseSortBy = "orderedOn"

// API request/response shapes

export interface PurchaseListContent {
  purchases: Purchase[]
  pageCount: number
  rows: number
}

export interface FetchPurchasesParams {
  page?: number
  pageSize?: number
  name?: string
  /** 0 or undefined: every status. */
  statusId?: number
  /** 0 newest order date first, 1 oldest first. */
  filter?: number
}

export interface PurchasePayload {
  supplierName?: string
  orderedOn: string
  note?: string
  lines: { productId: number; quantity: number; unitCost: number }[]
}

export interface UpdatePurchasePayload extends PurchasePayload {
  id: number
}

/** Every line of the purchase with how many arrived (0 up to the ordered quantity). */
export interface ReceivePurchasePayload {
  id: number
  lines: { productId: number; quantity: number }[]
}
