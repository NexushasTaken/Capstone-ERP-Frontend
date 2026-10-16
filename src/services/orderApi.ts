import type { StatusCount } from "@/types/statusCount"
import type { Discount, OrderGroup, OrderDriver, OrderStatus, OrderType } from "@/types/order"
import { ApiEnvelope, ApiEnvelopeNoContent } from "@/types/api"
import type {
  FetchOrdersParams,
  OrderListContent,
  InsertOrderPayload,
  UpdateOrderPayload,
  UpdateOrderStatusPayload,
} from "@/types/order"
import { ApiError } from "@/lib/apiError"

export async function fetchOrders(
  params: FetchOrdersParams = {},
  signal?: AbortSignal,
): Promise<{
  items: OrderGroup[]
  pageCount: number
  rows: number
}> {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.pageSize) query.set("pageSize", String(params.pageSize))
  if (params.name) query.set("name", params.name)
  if (params.orderTypeId !== undefined) query.set("orderTypeId", String(params.orderTypeId))
  if (params.statusId !== undefined) query.set("statusId", String(params.statusId))

  const response = await fetch(`/api/Order/all?${query.toString()}`, {
    cache: "no-store",
    signal,
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.status}`)
  }

  const data: ApiEnvelope<OrderListContent> = await response.json()

  if (!data.success) {
    throw new ApiError(data.message || "Failed to fetch orders", response.status, data.errors)
  }

  return {
    items: data.content.orders,
    pageCount: data.content.pageCount,
    rows: data.content.rows,
  }
}

export async function insertOrder(payload: InsertOrderPayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch("/api/Order/insert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to add order", response.status, data.errors)
  }

  return data
}

export async function updateOrder(payload: UpdateOrderPayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch("/api/Order/put", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to update order", response.status, data.errors)
  }

  return data
}

export async function fetchDiscounts(): Promise<Discount[]> {
  const response = await fetch("/api/Order/discounts", {
    method: "GET",
    credentials: "include",
  })

  const data: ApiEnvelope<Discount[]> = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to fetch discounts", response.status, data.errors)
  }

  return data.content
}

export async function fetchOrderTypes(): Promise<OrderType[]> {
  const response = await fetch("/api/Order/types", {
    method: "GET",
    credentials: "include",
  })

  const data: ApiEnvelope<OrderType[]> = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to fetch order types", response.status, data.errors)
  }

  return data.content
}

export async function fetchOrderStatuses(): Promise<OrderStatus[]> {
  const response = await fetch("/api/Order/status", {
    method: "GET",
    credentials: "include",
  })

  const data: ApiEnvelope<OrderStatus[]> = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to fetch order statuses", response.status, data.errors)
  }

  return data.content
}

export async function fetchOrderDrivers(): Promise<OrderDriver[]> {
  const response = await fetch("/api/Order/driver/active", {
    method: "GET",
    credentials: "include",
  })

  const data: ApiEnvelope<OrderDriver[]> = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to fetch delivery drivers", response.status, data.errors)
  }

  return data.content
}

export async function updateOrderStatus(payload: UpdateOrderStatusPayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch("/api/Order/status/patch", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to update order status", response.status, data.errors)
  }

  return data
}

export async function fetchOrderStatusCounts(signal?: AbortSignal): Promise<StatusCount[]> {
  const response = await fetch("/api/Order/status/count", {
    credentials: "include",
    cache: "no-store",
    signal,
  })
  if (!response.ok) throw new Error("Failed to fetch order status counts: " + response.status)
  const data: ApiEnvelope<StatusCount[]> = await response.json()
  if (!data.success) throw new ApiError(data.message || "Failed to fetch status counts", response.status, data.errors)
  return data.content
}
