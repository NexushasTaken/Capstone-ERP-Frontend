"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { fetchSales } from "@/services/saleApi"
import { queryKeys } from "@/lib/query/queryKeys"
import type { FetchSalesParams } from "@/types/sale"

export function useSales(params: FetchSalesParams) {
  return useQuery({
    queryKey: queryKeys.sales.all(params),
    queryFn: ({ signal }) => fetchSales(params, signal),
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}
