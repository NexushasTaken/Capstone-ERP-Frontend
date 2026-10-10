import { ApiEnvelope } from "@/types/api"
import type {
  DashboardInventoryContent,
  DemandBacktest,
  DemandBacktestParams,
  DemandChart,
  FetchInventoryForecastParams,
  FetchSalesOverviewParams,
  InventoryForecastContent,
  SalesOverviewContent,
} from "@/types/dashboard"
import { ApiError } from "@/lib/apiError"

export async function fetchSalesOverview(
  params: FetchSalesOverviewParams,
  signal?: AbortSignal,
): Promise<SalesOverviewContent> {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
  })

  const response = await fetch(`/api/Dashboard/sales?${query.toString()}`, {
    signal,
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch sales overview: ${response.status}`)
  }

  const data: ApiEnvelope<SalesOverviewContent> = await response.json()

  if (!data.success) {
    throw new ApiError(data.message || "Failed to fetch sales overview", response.status, data.errors)
  }

  return data.content
}

export async function fetchDashboardInventory(signal?: AbortSignal): Promise<DashboardInventoryContent> {
  const response = await fetch("/api/Dashboard/inventory", {
    signal,
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard inventory: ${response.status}`)
  }

  const data: ApiEnvelope<DashboardInventoryContent> = await response.json()

  if (!data.success) {
    throw new ApiError(data.message || "Failed to fetch dashboard inventory", response.status, data.errors)
  }

  return data.content
}

export async function fetchInventoryForecast(
  params: FetchInventoryForecastParams = {},
  signal?: AbortSignal,
): Promise<Omit<InventoryForecastContent, "forecastResults"> & { items: InventoryForecastContent["forecastResults"] }> {
  const query = new URLSearchParams({
    forceForecast: String(params.forceForecast ?? false),
  })
  if (params.page !== undefined) query.set("page", String(params.page))
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize))
  if (params.search) query.set("search", params.search)
  if (params.needOrderOnly) query.set("needOrderOnly", "true")
  const response = await fetch(`/api/Dashboard/inventory/forecast?${query.toString()}`, {
    signal,
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch inventory forecast: ${response.status}`)
  }

  const data: ApiEnvelope<InventoryForecastContent> = await response.json()

  if (!data.success) {
    throw new ApiError(data.message || "Failed to fetch inventory forecast", response.status, data.errors)
  }

  const { forecastResults, ...rest } = data.content
  return { ...rest, items: forecastResults }
}

export async function fetchDemandChart(productId: number, signal?: AbortSignal): Promise<DemandChart> {
  const response = await fetch(`/api/Dashboard/inventory/forecast/${productId}`, {
    signal,
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch demand chart: ${response.status}`)
  }

  const data: ApiEnvelope<DemandChart> = await response.json()

  if (!data.success) {
    throw new ApiError(data.message || "Failed to fetch demand chart", response.status, data.errors)
  }

  return data.content
}

export async function fetchDemandBacktest(
  productId: number,
  params: DemandBacktestParams,
  signal?: AbortSignal,
): Promise<DemandBacktest> {
  const query = new URLSearchParams({
    hiddenWeeks: String(params.hiddenWeeks),
    endWeeksAgo: String(params.endWeeksAgo),
  })
  const response = await fetch(`/api/Dashboard/inventory/forecast/${productId}/backtest?${query.toString()}`, {
    signal,
    method: "GET",
    credentials: "include",
  })

  const data: ApiEnvelope<DemandBacktest> = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to fetch the test", response.status, data.errors)
  }

  return data.content
}
