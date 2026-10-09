"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchDemandChart, fetchInventoryForecast } from "@/services/dashboardApi"
import { queryKeys } from "@/lib/query/queryKeys"
import type { FetchInventoryForecastParams } from "@/types/dashboard"

export function useDemandForecast(params: FetchInventoryForecastParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.inventoryForecast(params),
    queryFn: ({ signal }) => fetchInventoryForecast(params, signal),
    placeholderData: keepPreviousData,
  })
}

/** Weekly demand and the forecast of one product, loaded only while its chart is open. weeks 0 = all history. */
export function useDemandChart(productId: number | null, weeks: number) {
  return useQuery({
    queryKey: queryKeys.dashboard.demandChart(productId ?? 0, weeks),
    queryFn: ({ signal }) => fetchDemandChart(productId!, weeks, signal),
    enabled: productId !== null,
    placeholderData: keepPreviousData,
  })
}

/** Re-runs the forecast now, then refetches every forecast view (page, dashboard summary, chart, "need ordering" count). */
export function useForceForecast(onDone: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => fetchInventoryForecast({ forceForecast: true, page: 1, pageSize: 1 }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "inventory", "forecast"] })
      onDone()
      toast.success("Forecast updated.")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to run the forecast.")
    },
  })
}
