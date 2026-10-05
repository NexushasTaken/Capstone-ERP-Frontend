import type { Sale } from '@/types/sale'
import type { FetchSalesParams, SaleListContent } from '@/types/sale'

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
}> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.name) query.set('name', params.name)
  if (params.orderTypeId !== undefined) query.set('orderTypeId', String(params.orderTypeId))

  const response = await fetch(`/api/Sale/all?${query.toString()}`, {
    cache: 'no-store',
    signal,
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch sales: ${response.status}`)
  }

  const data: SaleEnvelope = await response.json()

  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch sales')
  }

  return {
    items: data.salesData.sales,
    pageCount: data.salesData.pageCount,
    rows: data.salesData.rows,
  }
}
