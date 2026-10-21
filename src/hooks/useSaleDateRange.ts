"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchSaleDateRange } from "@/services/saleApi"
import { queryKeys } from "@/lib/query/queryKeys"

// First and last day with a sale. Refetched on every visit like the list, so an order completed today shows up.
export function useSaleDateRange() {
  return useQuery({
    queryKey: queryKeys.sales.range,
    queryFn: ({ signal }) => fetchSaleDateRange(signal),
    staleTime: 0,
  })
}
