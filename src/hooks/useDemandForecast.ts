"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchDemandBacktest, fetchDemandChart, fetchInventoryForecast } from "@/services/dashboardApi"
import { queryKeys } from "@/lib/query/queryKeys"
import type { DemandBacktestParams, FetchInventoryForecastParams } from "@/types/dashboard"

export function useDemandForecast(params: FetchInventoryForecastParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.inventoryForecast(params),
    queryFn: ({ signal }) => fetchInventoryForecast(params, signal),
    placeholderData: keepPreviousData,
  })
}

/** The forecast of one product beside the same season in earlier years, loaded only while its chart is open. */
export function useDemandChart(productId: number | null) {
  return useQuery({
    queryKey: queryKeys.dashboard.demandChart(productId ?? 0),
    queryFn: ({ signal }) => fetchDemandChart(productId!, signal),
    enabled: productId !== null,
  })
}

/** One product's backtest with the chosen length and end point, loaded only while the test is shown. */
export function useDemandBacktest(productId: number, params: DemandBacktestParams, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.dashboard.demandBacktest(productId, params),
    queryFn: ({ signal }) => fetchDemandBacktest(productId, params, signal),
    placeholderData: keepPreviousData,
    enabled,
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
