import type {
  FetchPurchasesParams,
  PurchaseListContent,
  PurchasePayload,
  ReceivePurchasePayload,
  UpdatePurchasePayload,
} from "@/types/purchase"
import type { StatusCount } from "@/types/statusCount"
import { ApiEnvelope, ApiEnvelopeNoContent } from "@/types/api"
import { ApiError } from "@/lib/apiError"

// GET
export async function fetchPurchases(params: FetchPurchasesParams = {}) {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set("page", String(params.page))
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize))
  if (params.name) query.set("name", params.name)
  if (params.statusId) query.set("statusId", String(params.statusId))
  if (params.filter !== undefined) query.set("filter", String(params.filter))

  const response = await fetch(`/api/Purchase/all?${query.toString()}`, {
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch purchases: ${response.status}`)
  }

  const data: ApiEnvelope<PurchaseListContent> = await response.json()

  if (!data.success) {
    throw new ApiError(data.message || "Failed to fetch purchases", response.status, data.errors)
  }

  return {
    items: data.content.purchases,
    pageCount: data.content.pageCount,
    rows: data.content.rows,
  }
}

export async function fetchPurchaseStatusCounts(signal?: AbortSignal): Promise<StatusCount[]> {
  const response = await fetch("/api/Purchase/status/count", {
    credentials: "include",
    cache: "no-store",
    signal,
  })
  if (!response.ok) throw new Error("Failed to fetch purchase status counts: " + response.status)
  const data: ApiEnvelope<StatusCount[]> = await response.json()
  if (!data.success) throw new ApiError(data.message || "Failed to fetch status counts", response.status, data.errors)
  return data.content
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
export function insertPurchase(payload: PurchasePayload) {
  return send("/api/Purchase/insert", "POST", payload, "Failed to add purchase")
}

// PUT: only while ordered; the lines are replaced by the ones sent.
export function updatePurchase(payload: UpdatePurchasePayload) {
  return send("/api/Purchase/put", "PUT", payload, "Failed to update purchase")
}

// PATCH
export function cancelPurchase(id: number) {
  return send(
    `/api/Purchase/cancel?${new URLSearchParams({ id: String(id) })}`,
    "PATCH",
    undefined,
    "Failed to cancel purchase",
  )
}

// PATCH: stock goes up by what arrived.
export function receivePurchase(payload: ReceivePurchasePayload) {
  return send("/api/Purchase/receive", "PATCH", payload, "Failed to receive purchase")
}
