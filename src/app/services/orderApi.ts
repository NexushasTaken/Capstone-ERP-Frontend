import type {
  OrderGroup,
  OrderRider,
  OrderStatus,
  OrderType,
} from '@/app/types/order'
import { ApiEnvelope, ApiEnvelopeNoContent } from '@/app/utils/api/apiEnvelope'
import type { FetchOrdersParams, OrderListContent, InsertOrderPayloadItem, UpdateOrderStatusPayload } from '@/app/utils/api/types/order'

export async function fetchOrders(params: FetchOrdersParams = {}): Promise<{
  items: OrderGroup[]
  pageCount: number
  rows: number
}> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.name) query.set('name', params.name)
  if (params.filter !== undefined) query.set('filter', String(params.filter))
  if (params.statusId !== undefined) query.set('statusId', String(params.statusId))
  if (params.orderTypeId !== undefined) query.set('orderTypeId', String(params.orderTypeId))

  const response = await fetch(`/api/Order/all?${query.toString()}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.status}`)
  }

  const data: ApiEnvelope<OrderListContent> = await response.json()

  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch orders')
  }

  return {
    items: data.content.orders,
    pageCount: data.content.pageCount,
    rows: data.content.rows,
  }
}

export async function fetchAllOrders(params: Omit<FetchOrdersParams, 'page' | 'pageSize'> = {}): Promise<{
  items: OrderGroup[]
  pageCount: number
  rows: number
}> {
  const firstPage = await fetchOrders({
    ...params,
    page: 1,
    pageSize: 10,
  })

  if (firstPage.rows <= 10) return firstPage

  return fetchOrders({
    ...params,
    page: 1,
    pageSize: firstPage.rows,
  })
}

export async function insertOrder(payload: InsertOrderPayloadItem[]): Promise<ApiEnvelopeNoContent> {
  const response = await fetch('/api/Order/insert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to add order')
  }

  return data
}

export async function fetchOrderTypes(): Promise<OrderType[]> {
  const response = await fetch('/api/Order/types', {
    method: 'GET',
    credentials: 'include',
  })

  const data: ApiEnvelope<OrderType[]> = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch order types')
  }

  return data.content
}

export async function fetchOrderStatuses(): Promise<OrderStatus[]> {
  const response = await fetch('/api/Order/status', {
    method: 'GET',
    credentials: 'include',
  })

  const data: ApiEnvelope<OrderStatus[]> = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch order statuses')
  }

  return data.content
}

export async function fetchOrderRiders(): Promise<OrderRider[]> {
  const response = await fetch('/api/Order/riders', {
    method: 'GET',
    credentials: 'include',
  })

  const data: ApiEnvelope<OrderRider[]> = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch delivery riders')
  }

  return data.content
}

export async function updateOrderStatus(payload: UpdateOrderStatusPayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch('/api/Order/status/patch', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update order status')
  }

  return data
}
