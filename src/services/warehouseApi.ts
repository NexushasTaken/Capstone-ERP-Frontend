import type {
  FetchWarehousesParams,
  InsertWarehousePayload,
  UpdateWarehousePayload,
  WarehouseListContent,
  WarehouseListItem,
} from "@/types/warehouse"
import { ApiEnvelope, ApiEnvelopeNoContent } from "@/types/api"
import { ApiError } from "@/lib/apiError"

// GET
export async function fetchWarehouses(params: FetchWarehousesParams = {}): Promise<{
  items: WarehouseListItem[]
  pageCount: number
  rows: number
}> {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set("page", String(params.page))
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize))
  if (params.name) query.set("name", params.name)
  if (params.filter !== undefined) query.set("filter", String(params.filter))

  const response = await fetch(`/api/Inventory/warehouse/all?${query.toString()}`, {
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch warehouses: ${response.status}`)
  }

  const data: ApiEnvelope<WarehouseListContent> = await response.json()

  if (!data.success) {
    throw new ApiError(data.message || "Failed to fetch warehouses", response.status, data.errors)
  }

  return {
    items: data.content.warehouses.map((w) => ({
      id: w.id,
      name: w.name,
      address: w.address,
      stocks: w.stocks,
      created_At: w.created_At,
    })),
    pageCount: data.content.pageCount,
    rows: data.content.rows,
  }
}

// INSERT
export async function insertWarehouse(payload: InsertWarehousePayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch("/api/Inventory/warehouse/insert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to add warehouse", response.status, data.errors)
  }

  return data
}

// PATCH
export async function updateWarehouse(payload: UpdateWarehousePayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch("/api/Inventory/warehouse/patch", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to update warehouse", response.status, data.errors)
  }

  return data
}

// DELETE
export async function deleteWarehouse(id: number): Promise<ApiEnvelopeNoContent> {
  const query = new URLSearchParams({ id: String(id) })

  const response = await fetch(`/api/Inventory/warehouse/delete?${query.toString()}`, {
    method: "DELETE",
    credentials: "include",
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to delete warehouse", response.status, data.errors)
  }

  return data
}
