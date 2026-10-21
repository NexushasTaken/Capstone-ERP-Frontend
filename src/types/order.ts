/** The Discounts table's types. Senior, PWD and solo parent are the legal presets. */
export type DiscountType = "none" | "senior" | "pwd" | "solo_parent" | "custom"

/** A row of the Discounts table. `percent` is null for custom, whose rate is typed on the order. */
export interface Discount {
  id: number
  type: DiscountType
  percent: number | null
}

export interface OrderLine {
  productId: number
  productName: string
  unit: string | null
  quantity: number
  price: number
  totalAmount: number
}

export interface OrderGroup {
  orderId: number
  orderType: string
  orderStatus: string | null
  deliveryDriverId: number | null
  driverName: string | null
  customerName: string
  deliveryAddress: string | null
  created_At: string
  updated_At: string | null
  orders: OrderLine[]
  subtotal: number
  discountPercent: number
  discountId: number
  discountType: DiscountType
  discountAmount: number
  /** Net of the discount. */
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

export interface OrderDriver {
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
  deliveryDriverId: number
  customerName: string
  deliveryAddress: string
  discountPercent: number
  discountId: number
  orderLines: { productId: number; quantity: number }[]
}

export interface UpdateOrderPayload {
  orderId: number
  deliveryDriverId: number
  deliveryAddress: string
  discountPercent: number
  discountId: number
  orderLines: { productId: number; quantity: number }[]
}

export interface UpdateOrderStatusPayload {
  orderId: number
  orderStatusId: number
}
