'use client'

import { FulfillmentChart, SalesChart, type SalesChartType } from '@/app/components/DashboardCharts'
import PredictedStockouts from '@/app/components/PredictedStockouts'
import InventoryOverview from '@/app/components/inventory/InventoryOverview'
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Lottie } from 'lottie-react'
import { ArrowUpDown, MoveUpRight, Settings2 } from 'lucide-react'
import { Check } from 'lucide-react'
import { useState } from 'react'
import animatedRobot from "@/app/assets/json/animatedRobot.json"
import { useQuery } from '@tanstack/react-query'
import { fetchInventories } from '@/app/services/inventoryApi'
import { queryKeys } from '@/app/utils/query/queryKeys'
import { DatePickerWithRange } from '@/app/components/date-picker/RangePicker'

const salesChartOptions: { label: string; value: SalesChartType }[] = [
  { label: 'Line chart', value: 'line' },
  { label: 'Pie chart', value: 'pie' },
  { label: 'Bar chart', value: 'bar' },
]

export default function DashboardPage() {
  const [salesChartType, setSalesChartType] = useState<SalesChartType>('line')
  //const [isRobotAnimationPlaying, setIsRobotAnimationPlaying] = useState(false)
  

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
              <span className='flex'>
                <DatePickerWithRange />
              </span>
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
          <div
            className='flex w-full'
            // onBlur={() => setIsRobotAnimationPlaying(false)}
            // onFocus={() => setIsRobotAnimationPlaying(true)}
            // onMouseEnter={() => setIsRobotAnimationPlaying(true)}
            // onMouseLeave={() => setIsRobotAnimationPlaying(false)}
            // tabIndex={0}
          >
            <Lottie
              src={animatedRobot}
              //autoplay={isRobotAnimationPlaying}
              autoplay
              loop
              style={{ width: 160, height: 160 }}
            />

            <div className="flex w-full h-full rounded-lg bg-[#EBF3ED] py-4 px-6">
              <div className='rounded-lg flex w-full h-full bg-white'>
                  
              </div>
            </div>
          </div>

          <PredictedStockouts inventories={inventories} isLoading={isLoading} loadError={loadError} />
        </div>

        {/* INVENTORY OVERVIEW */}
        <InventoryOverview />
      </div>
    </div>
  )
}
