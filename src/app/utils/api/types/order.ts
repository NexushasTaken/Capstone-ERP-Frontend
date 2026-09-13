import type { OrderGroup } from '@/app/types/order'

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
