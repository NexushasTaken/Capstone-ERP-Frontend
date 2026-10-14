import type { Sale } from "@/types/sale"
import type { FetchSalesParams, SaleDateRange, SaleListContent } from "@/types/sale"
import { ApiError } from "@/lib/apiError"

interface SaleEnvelope {
  status: number
  success: boolean
  message: string
  salesData: SaleListContent
}

export async function fetchSales(
  params: FetchSalesParams = {},
  signal?: AbortSignal,
): Promise<{
  items: Sale[]
  pageCount: number
  rows: number
  totalAmount: number
}> {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.pageSize) query.set("pageSize", String(params.pageSize))
  if (params.name) query.set("name", params.name)
  if (params.orderTypeId !== undefined) query.set("orderTypeId", String(params.orderTypeId))
  if (params.filter !== undefined) query.set("filter", String(params.filter))
  if (params.from) query.set("from", params.from)
  if (params.to) query.set("to", params.to)

  const response = await fetch(`/api/Sale/all?${query.toString()}`, {
    cache: "no-store",
    signal,
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch sales: ${response.status}`)
  }

  const data: SaleEnvelope = await response.json()

  if (!data.success) {
    throw new ApiError(data.message || "Failed to fetch sales", response.status)
  }

  return {
    items: data.salesData.sales,
    pageCount: data.salesData.pageCount,
    rows: data.salesData.rows,
    totalAmount: data.salesData.totalAmount,
  }
}

interface SaleDateRangeEnvelope {
  status: number
  success: boolean
  message: string
  range: SaleDateRange
}

export async function fetchSaleDateRange(signal?: AbortSignal): Promise<SaleDateRange> {
  const response = await fetch("/api/Sale/range", {
    cache: "no-store",
    signal,
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch the sales date range: ${response.status}`)
  }

  const data: SaleDateRangeEnvelope = await response.json()

  if (!data.success) {
    throw new ApiError(data.message || "Failed to fetch the sales date range", response.status)
  }

  return data.range
}
