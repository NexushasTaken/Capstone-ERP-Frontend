import type { DriverListItem } from "@/types/driver"
import type { DriverListContent, FetchDriversParams, InsertDriverPayload, UpdateDriverPayload } from "@/types/driver"
import { ApiEnvelope, ApiEnvelopeNoContent } from "@/types/api"

export async function fetchDrivers(
  params: FetchDriversParams = {},
  signal?: AbortSignal,
): Promise<{
  items: DriverListItem[]
  pageCount: number
  rows: number
}> {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.pageSize) query.set("pageSize", String(params.pageSize))
  if (params.name) query.set("name", params.name)
  if (params.filter !== undefined) query.set("filter", String(params.filter))

  const response = await fetch(`/api/Order/driver/all?${query.toString()}`, {
    signal,
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch drivers: ${response.status}`)
  }

  const data: ApiEnvelope<DriverListContent> = await response.json()

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch drivers")
  }

  return {
    items: data.content.deliveryDrivers,
    pageCount: data.content.pageCount,
    rows: data.content.rows,
  }
}

export async function insertDriver(payload: InsertDriverPayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch("/api/Order/driver/insert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to add driver")
  }

  return data
}

export async function updateDriver(payload: UpdateDriverPayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch("/api/Order/driver/put", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update driver")
  }

  return data
}

export async function deleteDriver(id: number): Promise<ApiEnvelopeNoContent> {
  const query = new URLSearchParams({ id: String(id) })

  const response = await fetch(`/api/Order/driver/delete?${query.toString()}`, {
    method: "DELETE",
    credentials: "include",
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to delete driver")
  }

  return data
}
