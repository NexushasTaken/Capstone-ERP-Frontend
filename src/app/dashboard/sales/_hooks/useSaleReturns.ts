"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchSaleReturns, returnSaleItems } from "@/services/saleApi"
import { invalidateInventories } from "@/lib/query/queryInvalidation"
import { queryKeys } from "@/lib/query/queryKeys"
import type { FetchSaleReturnsParams } from "@/types/sale"

export function useSaleReturns(params: FetchSaleReturnsParams) {
  return useQuery({
    queryKey: queryKeys.sales.returns(params),
    queryFn: ({ signal }) => fetchSaleReturns(params, signal),
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}

// A return changes the sale's refund, the stock and the dashboard's sales, so all three refetch.
export function useSaleReturnMutations() {
  const queryClient = useQueryClient()

  const returnItems = useMutation({
    mutationFn: returnSaleItems,
    onSuccess: () => {
      toast.success("Return recorded")
      queryClient.invalidateQueries({ queryKey: ["sales"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      invalidateInventories(queryClient)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to record the return")
    },
  })

  return { returnItems }
}
