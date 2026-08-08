'use client'

import { Ellipsis, ArrowDownUp } from 'lucide-react'
import { formatOrderId, formatPhilippineLocation, statusDotClass } from '@/app/utils/orderHelpers'
import { mockOrders, orderStatusFilters } from '@/app/utils/orderMockData'
import { useState } from 'react'
import SeeMoreModal from '@/app/components/modals/SeeMoreModal'

const tableColumns = [
  'Order ID',
  'Order assigned to',
  'Pickup address',
  'Delivery address',
  'Est. delivery',
  'Status',
]

export default function OrdersForm() {
  const [isSeeMoreOpen, setIsSeeMoreOpen] = useState(false);

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-2xl bg-white p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-[#121514]">Orders</h1>
          <span className="rounded-md border border-[#DFE2E0] px-3 py-1 text-sm text-[#121514]">10</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {orderStatusFilters.map((filter) => (
            <button
              className={`cursor-pointer rounded-xl border px-3 py-2 text-sm whitespace-nowrap ${
                filter.label === 'Assigned'
                  ? 'border-[#121514] bg-[#121514] text-white'
                  : 'border-[#E1E4E2] bg-white text-[#121514]'
              }`}
              key={filter.label}
              type="button"
            >
              {filter.label} <span className="ml-1">{filter.count}</span>
            </button>
          ))}
          <button aria-label="Sort orders" className="cursor-pointer rounded-xl border border-[#E1E4E2] p-2 text-[#121514]" type="button">
            <ArrowDownUp size={18} />
          </button>
        </div>
      </div>

      <div className="mt-5 min-h-0 overflow-auto scrollbar-none">
        <table className="w-full min-w-235 border-separate border-spacing-y-2 text-left">
          <thead className="text-sm font-normal text-[#737A76]">
            <tr>
              {tableColumns.map((column) => (
                <th className="px-3 pb-1 font-normal" key={column} scope="col">
                  {column}
                </th>
              ))}
              <th aria-label="Order actions" />
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((order) => (
              <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={order.id}>
                <td className="rounded-l-xl px-3 py-5 font-medium">{formatOrderId(order.id)}</td>
                <td className="px-3 py-5 font-medium">{order.assignedTo}</td>
                <td className="px-3 py-5">
                  <span className="mr-2" role="img" aria-label="Philippines">{order.pickupAddress.flag}</span>
                  {formatPhilippineLocation(order.pickupAddress)}
                </td>
                <td className="px-3 py-5">
                  <span className="mr-2" role="img" aria-label="Philippines">{order.deliveryAddress.flag}</span>
                  {formatPhilippineLocation(order.deliveryAddress)}
                </td>
                <td className="px-3 py-5 font-medium whitespace-nowrap">{order.estimatedDelivery}</td>
                <td className="px-3 py-5 whitespace-nowrap">
                  <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${statusDotClass(order.status)}`} />
                  {order.status}
                </td>
                <td className="rounded-r-xl px-3 py-5">
                  <div className="flex items-center justify-end gap-2">
                    <button className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-1.5 text-sm whitespace-nowrap" type="button" onClick={() => setIsSeeMoreOpen(true)}>
                      See more
                    </button>
                    <button aria-label={`More actions for order ${order.id}`} className="cursor-pointer rounded-xl border border-[#DFE2E0] p-1.5" type="button">
                      <Ellipsis size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SeeMoreModal onClose={() => setIsSeeMoreOpen(false)} open={isSeeMoreOpen}>
        <div className=''>

        </div>
      </SeeMoreModal>
    </section>
  )
}
