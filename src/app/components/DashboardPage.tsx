import { FulfillmentChart, SalesChart } from '@/app/components/DashboardCharts'
import OrdersForm from '@/app/components/orders/OrdersForm'
import { ArrowUpDown, ArrowUpRight, Calendar, MoveUpRight, Settings2 } from 'lucide-react'
import React from 'react'

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col gap-4 overflow-y-auto p-3 md:h-screen md:overflow-hidden md:p-4 lg:w-4/5">
        {/* Charts Overview */}
        <div className="flex shrink-0 flex-col gap-4 rounded-lg bg-[#EBF3ED] p-4 md:h-[44%] md:flex-row">
          {/* Fulfillment Performance */}
          <div className="flex min-h-76 w-full flex-col gap-4 p-4 md:h-full md:min-h-0 md:w-1/2">
            <div className="flex w-full gap-4 justify-between items-center">
              <span className="text-[#0c0d0d] text-lg font-medium md:text-2xl">
                Fulfillment Performance
              </span>
              <div className="flex gap-2">
                <button aria-label="Calendar" type="button" className="bg-transparent border-2 border-[#C6C6C7] rounded-xl text-[#0c0d0d] font-medium p-2 cursor-pointer transition-all duration-300 hover:scale-105 group">
                  <Calendar className="transition-all group-hover:scale-105"/>
                </button>
                <button aria-label="ArrowUpRight" type="button" className="bg-transparent border-2 border-[#C6C6C7] rounded-xl text-[#0c0d0d] font-medium p-2 cursor-pointer transition-all duration-300 hover:scale-105 group">
                  <ArrowUpRight className="transition-all group-hover:scale-105"/>
                </button>
              </div>
            </div>
          
            <div className='relative w-full min-h-0 flex-1 p-4'>
                <FulfillmentChart />
            </div>
          </div>
          
          {/* Sales Overview */}
          <div className="flex min-h-76 w-full flex-col gap-4 p-4 md:h-full md:min-h-0 md:w-1/2">
            <div className="flex w-full gap-4 justify-between items-center">
              <span className="text-[#0c0d0d] text-lg font-medium md:text-2xl">
                Sales Overview
              </span>
              <div className="flex gap-2">
                <button aria-label="Settings" type="button" className="bg-transparent border-2 border-[#C6C6C7] rounded-xl text-[#0c0d0d] font-medium p-2 cursor-pointer transition-all duration-300 hover:scale-105 group">
                  <Settings2 className="transition-all group-hover:scale-105"/>
                </button>
                <button aria-label="ArrowUpDown" type="button" className="bg-transparent border-2 border-[#C6C6C7] rounded-xl text-[#0c0d0d] font-medium p-2 cursor-pointer transition-all duration-300 hover:scale-105 group">
                  <ArrowUpDown className="transition-all group-hover:scale-105"/>
                </button>
              </div>
            </div>
          
            <div className='relative w-full min-h-0 flex-1 p-4'>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-[#0c0d0d] md:text-5xl">
                  <span className="text-[#909191]">&#8369;</span>
                  440,925
                </span>
                <span className="rounded-md text-nowrap border border-[#D7DFD9] bg-[#F4F7F4] px-2 py-1 text-xs text-[#68716C] md:text-sm">
                  32.2% <MoveUpRight  className="h-4 w-4"/>
                </span>
              </div>
                <SalesChart />
            </div>
          </div>

        </div>

        {/* Orders */}
        <div className="flex min-h-0 w-full flex-1">
          <OrdersForm />
          <div className="flex h-full bg-[#EBF3ED] rounded-lg w-2/5">
            {/* for next task: put the inventory overview here cleanly without making the layout messy */}
          </div>
        </div>
    </div>
  )
}
