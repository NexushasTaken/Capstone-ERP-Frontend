import { ApiEnvelope } from '@/app/utils/api/apiEnvelope'
import type {
  DashboardInventoryContent,
  FetchSalesOverviewParams,
  SalesOverviewContent,
} from '@/app/utils/api/types/dashboard'

export async function fetchSalesOverview(
  params: FetchSalesOverviewParams,
  signal?: AbortSignal
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
