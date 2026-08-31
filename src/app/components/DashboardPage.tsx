'use client'

import { FulfillmentChart, SalesChart, type SalesChartType } from '@/app/components/DashboardCharts'
import InventoryOverview from '@/app/components/inventory/InventoryOverview'
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Lottie } from 'lottie-react'
import { ArrowUpDown, Calendar, MoveUpRight, Settings2 } from 'lucide-react'
import { Check } from 'lucide-react'
import { useState } from 'react'
import animatedRobot from "@/app/assets/json/animatedRobot.json"
import { PredictedStockout } from '@/app/types/inventory'
import { useQuery } from '@tanstack/react-query'
import { fetchInventories } from '@/app/utils/api/inventoryApi'
import { queryKeys } from '@/app/utils/api/queryKeys'
import { formatNumber } from '@/app/utils/helpers/inventoryHelpers'
import { PaginationDemo } from '@/app/components/Pagination'
import Loading from '@/app/components/loaders/Loading'

const salesChartOptions: { label: string; value: SalesChartType }[] = [
  { label: 'Line chart', value: 'line' },
  { label: 'Pie chart', value: 'pie' },
  { label: 'Bar chart', value: 'bar' },
]

export default function DashboardPage() {
  const [salesChartType, setSalesChartType] = useState<SalesChartType>('line')
  
  const [stockoutCurrentPage, setStockoutCurrentPage] = useState(1)
  const stockoutItemsPerPage = 10

  const inventoriesQueryParams = { page: 1, pageSize: 100 }
  const inventoriesQueryKey = queryKeys.inventories.all(inventoriesQueryParams)
  const {
      data: inventoriesResponse,
      isLoading,
      error: loadError,
    } = useQuery({
      queryKey: inventoriesQueryKey,
      queryFn: () => fetchInventories(inventoriesQueryParams),
  })

  const inventories = inventoriesResponse?.items ?? []

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
  const paginatedStockouts = predictedStockouts.slice(
    (stockoutCurrentPage - 1) * stockoutItemsPerPage,
    stockoutCurrentPage * stockoutItemsPerPage
  )

  return (
    <div className="flex h-dvh scrollbar-none w-full flex-col gap-4 overflow-auto p-3 bg-white">

      {/* Charts Overview */}
      <div className="flex shrink-0 flex-col gap-4 rounded-lg bg-[#EBF3ED] p-4">
        {/* <div className='flex items-center justify-end w-full'>
          <button className='inline-flex gap-2 items-center h-fit p-4 rounded-2xl text-base text-white bg-[#0c0d0d]'>
            <Plus className='text-white h-5 w-5' />
            Add New Order
          </button>
        </div> */}
        <div className='flex flex-col xl:flex-row w-full'>
          {/* Fulfillment Performance */}
          <div className="flex min-h-76 w-full flex-col gap-4 p-4 xl:w-1/2">
            <div className="flex w-full gap-4 justify-between items-center">
              <span className="text-[#0c0d0d] text-lg font-medium md:text-2xl">
                Fulfillment Performance
              </span>
              <button aria-label="Calendar" type="button" className="bg-transparent border-2 border-[#C6C6C7] rounded-xl text-[#0c0d0d] font-medium p-2 cursor-pointer transition-all duration-300 hover:scale-105 group">
                <Calendar className="transition-all group-hover:scale-105" />
              </button>
            </div>

            <div className='relative w-full min-h-0 flex-1'>
              <FulfillmentChart />
            </div>
          </div>

          {/* Sales Overview */}
          <div className="flex min-h-76 w-full flex-col gap-4 p-4 xl:w-1/2">
            <div className="flex w-full gap-4 justify-between items-center">
              <span className="text-[#0c0d0d] text-lg font-medium md:text-2xl">
                Sales Overview
              </span>
              <div className="flex gap-2">
                <button aria-label="Settings" type="button" className="bg-transparent border-2 border-[#C6C6C7] rounded-xl text-[#0c0d0d] font-medium p-2 cursor-pointer transition-all duration-300 hover:scale-105 group">
                  <Settings2 className="transition-all group-hover:scale-105" />
                </button>
                <Popover>
                  <PopoverTrigger className="bg-transparent border-2 border-[#C6C6C7] rounded-xl text-[#0c0d0d] font-medium p-2 cursor-pointer transition-all duration-300 hover:scale-105 group">
                    <ArrowUpDown className="transition-all group-hover:scale-105" />
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-60">
                    <PopoverHeader className="border-b px-4 py-3">
                      <PopoverTitle>Chart view</PopoverTitle>
                    </PopoverHeader>

                    <div className="flex flex-col">
                      {salesChartOptions.map((option) => {
                        const selected = salesChartType === option.value

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setSalesChartType(option.value)}
                            className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-[#F7F9F7] ${selected ? 'bg-[#F7F9F7] font-medium' : ''
                              }`}
                          >
                            <span>{option.label}</span>

                            {selected && (
                              <Check size={16} className="text-[#121514]" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className='relative w-full min-h-0 flex-1'>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-[#0c0d0d] md:text-5xl">
                  <span className="text-[#909191]">&#8369;</span>
                  440,925
                </span>
                <span className="inline-flex items-center gap-1 rounded-md text-nowrap border border-[#D7DFD9] bg-[#F4F7F4] px-2 py-1 text-xs text-[#68716C] md:text-sm">
                  32.2% <MoveUpRight className="h-4 w-4" />
                </span>
              </div>
              <SalesChart type={salesChartType} />
            </div>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="flex flex-col xl:flex-row gap-4 w-full">
        <div className="flex flex-col w-full h-full gap-4">
          {/* AI KUNO NAMED STEVEN */}
          <div className='flex w-full'>
            <Lottie
              src={animatedRobot}
              autoplay
              loop
              style={{ width: 160, height: 160 }}
            />

            <div>
              
            </div>
          </div>

          {/* PREDICTED STOCKOUTS */}
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
                  currentPage={stockoutCurrentPage}
                  totalPages={stockoutTotalPages}
                  onPageChange={setStockoutCurrentPage}
                />
              </div>
            </div>
          </article>
        </div>

        {/* INVENTORY OVERVIEW */}
        <InventoryOverview />
      </div>
    </div>
  )
}
