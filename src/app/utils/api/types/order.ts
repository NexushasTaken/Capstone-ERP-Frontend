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

export interface InsertOrderPayloadItem {
  productId: number
  orderTypeId: number
  deliveryRiderId: number
  quantity: number
  customerName: string
  pickUpAddress: string
  deliveryAddress: string
}

export interface UpdateOrderStatusPayload {
  orderId: number
  orderStatusId: number
}
