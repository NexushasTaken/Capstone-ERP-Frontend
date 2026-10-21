import type { FetchUnitsParams, InsertUnitPayload, UnitListContent, UpdateUnitPayload } from "@/types/unit"
import { ApiEnvelope, ApiEnvelopeNoContent } from "@/types/api"
import { ApiError } from "@/lib/apiError"

// GET
export async function fetchUnits(params: FetchUnitsParams = {}) {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set("page", String(params.page))
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize))
  if (params.name) query.set("name", params.name)
  if (params.filter !== undefined) query.set("filter", String(params.filter))

  const response = await fetch(`/api/Unit/all?${query.toString()}`, {
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch units: ${response.status}`)
  }

  const data: ApiEnvelope<UnitListContent> = await response.json()

  if (!data.success) {
    throw new ApiError(data.message || "Failed to fetch units", response.status, data.errors)
  }

  return {
    items: data.content.units,
    pageCount: data.content.pageCount,
    rows: data.content.rows,
  }
}

async function send(url: string, method: string, payload: unknown, failure: string): Promise<ApiEnvelopeNoContent> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: payload === undefined ? undefined : JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || failure, response.status, data.errors)
  }

  return data
}

// INSERT
export function insertUnit(payload: InsertUnitPayload) {
  return send("/api/Unit/insert", "POST", payload, "Failed to add unit")
}

// PATCH
export function updateUnit(payload: UpdateUnitPayload) {
  return send("/api/Unit/patch", "PATCH", payload, "Failed to update unit")
}

// DELETE: refused while products use the unit; the message says how many.
export function deleteUnit(id: number) {
  return send(
    `/api/Unit/delete?${new URLSearchParams({ id: String(id) })}`,
    "DELETE",
    undefined,
    "Failed to delete unit",
  )
}
