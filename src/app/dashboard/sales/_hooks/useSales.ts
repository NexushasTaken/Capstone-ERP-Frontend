'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchSales } from '@/services/saleApi'
import { fetchOrderTypes } from '@/services/orderApi'
import { queryKeys } from '@/lib/query/queryKeys'
import type { FetchSalesParams } from '@/types/sale'

export function useSales(params: FetchSalesParams) {
  return useQuery({
    queryKey: queryKeys.sales.all(params),
    queryFn: ({ signal }) => fetchSales(params, signal),
    staleTime: 0,
    keepPreviousData: true,
  })
}

export function useOrderTypes() {
  return useQuery({
    queryKey: queryKeys.orders.types,
    queryFn: fetchOrderTypes,
  })
}
