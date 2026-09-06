'use client'

import { useState } from 'react'
import type { InventoryListItem, PredictedStockout } from '@/app/types/inventory'
import { formatNumber } from '@/app/utils/helpers/inventoryHelpers'
import { PaginationDemo } from '@/app/components/Pagination'
import Loading from '@/app/components/loaders/Loading'

interface PredictedStockoutsProps {
  inventories: InventoryListItem[]
  isLoading: boolean
  loadError: unknown
}

export default function PredictedStockouts({ inventories, isLoading, loadError }: PredictedStockoutsProps) {
  const [stockoutCurrentPage, setStockoutCurrentPage] = useState(1)
  const stockoutItemsPerPage = 10

  const criticalInventories = inventories.filter((item) => item.status === 'critical')

  const predictedStockouts: PredictedStockout[] = criticalInventories.map((item) => ({
      inventoryId: String(item.id),
      product: item.name,
      warehouse: item.warehouseName,
      availableUnits: item.quantity,
      reorderPoint: item.reorderPoint,
      estimatedStockoutDate: 'Within 7 days',
      risk: 'critical',
  }))

  const forecastWarningCount = criticalInventories.length

  const stockoutTotalPages = Math.max(1, Math.ceil(predictedStockouts.length / stockoutItemsPerPage))
  const effectivePage = Math.min(stockoutCurrentPage, stockoutTotalPages)
  const paginatedStockouts = predictedStockouts.slice(
    (effectivePage - 1) * stockoutItemsPerPage,
    effectivePage * stockoutItemsPerPage
  )

  return (
    <article className="w-full min-w-0 rounded-2xl border border-[#DCE4DE] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E7ECE8] p-5">
        <div>
          <h2 className="font-semibold text-[#0c0d0d]">Predicted stockouts</h2>
          <p className="mt-1 text-xs lg:text-sm text-[#68716C]">Products marked Critical and likely to run out soon</p>
        </div>
        <span className="rounded-lg bg-[#FBE7E7] px-2.5 py-1 text-xs font-semibold text-[#B42318]">{forecastWarningCount} risks</span>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-162.5 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#F7F9F7] text-xs uppercase tracking-wide text-[#68716C]">
            <tr>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Available</th>
              <th className="px-4 py-3 font-medium">Reorder point</th>
              <th className="px-4 py-3 font-medium">Est. stockout</th>
              <th className="px-5 py-3 text-right font-medium">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7ECE8]">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm text-[#68716C]">
                  <Loading />
                </td>
              </tr>
            ) : loadError ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm text-[#B42318]">
                  {loadError instanceof Error ? loadError.message : 'Failed to load predicted stockouts'}
                </td>
              </tr>
            ) : paginatedStockouts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm text-[#68716C]">
                  No predicted stockouts.
                </td>
              </tr>
            ) : (
              paginatedStockouts.map((item) => {
                return (
                  <tr className="text-[#0c0d0d]" key={item.inventoryId}>
                    <td className="px-5 py-4">
                      <p className="font-medium capitalize">{item.product}</p>
                      <p className="mt-0.5 text-xs text-[#68716C] capitalize">{item.inventoryId} · {item.warehouse}</p>
                    </td>
                    <td className="px-4 py-4">{formatNumber(item.availableUnits)}</td>
                    <td className="px-4 py-4">{formatNumber(item.reorderPoint)}</td>
                    <td className="px-4 py-4 text-[#68716C]">{item.estimatedStockoutDate}</td>
                    <td className="px-5 py-4 text-right">
                      <span className="rounded-lg bg-[#FBE7E7] px-2.5 py-1 text-xs font-semibold text-[#B42318]">
                        Critical
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-[#E7ECE8] p-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-[#737A76]">
          Showing {isLoading || loadError ? 0 : paginatedStockouts.length} of {isLoading || loadError ? 0 : predictedStockouts.length} predicted stockouts
        </span>

        <div className="flex">
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
