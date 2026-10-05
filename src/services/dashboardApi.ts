import { ApiEnvelope } from '@/types/api'
import type {
  DashboardInventoryContent,
  FetchInventoryForecastParams,
  FetchSalesOverviewParams,
  InventoryForecastContent,
  SalesOverviewContent,
} from '@/types/dashboard'

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
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch sales overview: ${response.status}`)
  }

  const data: ApiEnvelope<SalesOverviewContent> = await response.json()

  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch sales overview')
  }

  return data.content
}

export async function fetchDashboardInventory(signal?: AbortSignal): Promise<DashboardInventoryContent> {
  const response = await fetch('/api/Dashboard/inventory', {
    signal,
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard inventory: ${response.status}`)
  }

  const data: ApiEnvelope<DashboardInventoryContent> = await response.json()

  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch dashboard inventory')
  }

  return data.content
}

export async function fetchInventoryForecast(
  params: FetchInventoryForecastParams = {},
  signal?: AbortSignal,
): Promise<{
  items: InventoryForecastContent['forecastResults']
  pageCount: number
  rows: number
}> {
  const query = new URLSearchParams({
    forceForecast: String(params.forceForecast ?? false),
  })
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.pageSize !== undefined) query.set('pageSize', String(params.pageSize))
  const response = await fetch(`/api/Dashboard/inventory/forecast?${query.toString()}`, {
    signal,
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch inventory forecast: ${response.status}`)
  }

  const data: ApiEnvelope<InventoryForecastContent> = await response.json()

  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch inventory forecast')
  }

  return {
    items: data.content.forecastResults,
    pageCount: data.content.pageCount,
    rows: data.content.rows,
  }
}
