import { downloadPdf } from "@/lib/downloadPdf"
import type { ReportPeriod } from "@/types/report"
import type { Sale } from "@/types/sale"
import type {
  FetchSaleReturnsParams,
  FetchSalesParams,
  SaleDateRange,
  SaleListContent,
  SaleReturn,
  SaleReturnListContent,
  SaleReturnPayload,
} from "@/types/sale"
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

interface SaleReturnEnvelope {
  status: number
  success: boolean
  message: string
  returnsData: SaleReturnListContent
}

export async function fetchSaleReturns(
  params: FetchSaleReturnsParams = {},
  signal?: AbortSignal,
): Promise<{ items: SaleReturn[]; pageCount: number; rows: number }> {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.pageSize) query.set("pageSize", String(params.pageSize))
  if (params.name) query.set("name", params.name)
  if (params.from) query.set("from", params.from)
  if (params.to) query.set("to", params.to)

  const response = await fetch(`/api/Sale/returns?${query.toString()}`, {
    cache: "no-store",
    signal,
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch returns: ${response.status}`)
  }

  const data: SaleReturnEnvelope = await response.json()

  if (!data.success) {
    throw new ApiError(data.message || "Failed to fetch returns", response.status)
  }

  return {
    items: data.returnsData.returns,
    pageCount: data.returnsData.pageCount,
    rows: data.returnsData.rows,
  }
}

export async function returnSaleItems(payload: SaleReturnPayload): Promise<void> {
  const response = await fetch("/api/Sale/return", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok || !data?.success) {
    throw new ApiError(data?.message || "Failed to record the return", response.status, data?.errors)
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

// Downloads the sales report PDF for the period around `date` (`yyyy-MM-dd`, a Philippine day).
export function downloadSalesReport(period: ReportPeriod, date: string): Promise<void> {
  return downloadPdf(
    `/api/Sale/report?${new URLSearchParams({ period, date })}`,
    `sales-${period}-${date}.pdf`,
    "Failed to export the sales report",
  )
}
