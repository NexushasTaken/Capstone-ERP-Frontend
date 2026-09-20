'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PaginationDemo } from '@/app/components/Pagination'
import Loading from '@/app/components/loaders/Loading'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { fetchInventoryForecast } from '@/app/services/dashboardApi'
import { queryKeys } from '@/app/utils/query/queryKeys'
import { formatDate, formatInventoryId } from '@/app/utils/helpers/inventoryHelpers'

export default function PredictedStockouts() {
  const [stockoutCurrentPage, setStockoutCurrentPage] = useState(1)
  const [isShowingForcedForecast, setIsShowingForcedForecast] = useState(false)
  const stockoutItemsPerPage = 10
  const forecastParams = { page: stockoutCurrentPage, pageSize: stockoutItemsPerPage }
  const queryClient = useQueryClient()
  const forecastQuery = useQuery({
    queryKey: queryKeys.dashboard.inventoryForecast(forecastParams),
    queryFn: ({ signal }) => fetchInventoryForecast(forecastParams, signal),
  })
  const forceForecastMutation = useMutation({
    mutationFn: () => fetchInventoryForecast({
      forceForecast: true,
      page: 1,
      pageSize: stockoutItemsPerPage,
    }),
    onSuccess: (forecast) => {
      queryClient.setQueryData(
        queryKeys.dashboard.inventoryForecast({ page: 1, pageSize: stockoutItemsPerPage }),
        forecast
      )
      setStockoutCurrentPage(1)
      setIsShowingForcedForecast(true)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to force inventory forecast.')
    },
  })

  const predictedStockouts = forecastQuery.data?.items ?? []
  const loadError = forecastQuery.error
  const forecastWarningCount = forecastQuery.data?.rows ?? 0
  const stockoutTotalPages = Math.max(1, forecastQuery.data?.pageCount ?? 1)
  const effectivePage = Math.min(stockoutCurrentPage, stockoutTotalPages)

  return (
    <article className="w-full min-w-0 rounded-2xl border border-[#DCE4DE] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E7ECE8] p-5">
        <div>
          <h2 className="font-semibold text-[#0c0d0d]">Predicted stockouts</h2>
          <p className="mt-1 text-xs text-[#68716C] lg:text-sm">Products forecast to run out soon</p>
        </div>
        <div className="flex items-center gap-2">
          {isShowingForcedForecast && (
            <span className="max-w-72 text-right text-xs text-[#68716C]">
              Showing force-forecast data. Run it again to refresh the results.
            </span>
          )}
          <Button
            className="rounded-xl px-3 py-2 text-sm"
            disabled={forceForecastMutation.isPending}
            onClick={() => forceForecastMutation.mutate()}
            type="button"
          >
            {forceForecastMutation.isPending ? 'Forecasting...' : 'Force Forecast'}
          </Button>
          <span className="rounded-lg bg-[#FBE7E7] px-2.5 py-1 text-xs font-semibold text-[#B42318]">
            {forecastWarningCount} risks
          </span>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full min-w-162.5 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#F7F9F7] text-xs uppercase tracking-wide text-[#68716C]">
            <tr>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Inventory ID</th>
              <th className="px-5 py-3 text-right font-medium">Earliest stockout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7ECE8]">
            {forecastQuery.isLoading || forceForecastMutation.isPending ? (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-sm text-[#68716C]">
                  <Loading />
                </td>
              </tr>
            ) : loadError ? (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-sm text-[#B42318]">
                  {loadError instanceof Error ? loadError.message : 'Failed to load predicted stockouts'}
                </td>
              </tr>
            ) : predictedStockouts.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-sm text-[#68716C]">
                  No predicted stockouts.
                </td>
              </tr>
            ) : (
              predictedStockouts.map((item) => (
                <tr className="text-[#0c0d0d]" key={item.inventoryId}>
                  <td className="px-5 py-4 font-medium capitalize">{item.name}</td>
                  <td className="px-4 py-4">{formatInventoryId(String(item.inventoryId))}</td>
                  <td className="px-5 py-4 text-right text-[#68716C]">
                    {formatDate(item.earliestStockOutDay)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-[#E7ECE8] p-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-[#737A76]">
          Showing {forecastQuery.isLoading || loadError ? 0 : predictedStockouts.length} of{' '}
          {forecastQuery.isLoading || loadError ? 0 : forecastWarningCount} predicted stockouts
        </span>
        <div className='flex'>
        <PaginationDemo
          currentPage={effectivePage}
          totalPages={stockoutTotalPages}
          onPageChange={setStockoutCurrentPage}
        />
        </div>
      </div>
    </article>
  )
}
