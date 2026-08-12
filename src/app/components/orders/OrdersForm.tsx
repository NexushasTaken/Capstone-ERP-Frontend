'use client'

import { Ellipsis, ArrowDownUp, Search, X } from 'lucide-react'
import { formatOrderId, formatPhilippineLocation, statusDotClass } from '@/app/utils/orderHelpers'
import { mockOrders, orderStatusFilters } from '@/app/utils/orderMockData'
import { formatPeso } from '@/app/utils/saleHelpers'
import { exportToCSV } from '@/app/utils/exportToCsv'
import { useState } from 'react'
import SeeMoreModal from '@/app/components/modals/SeeMoreModal'

const tableColumns = [
  'Order ID',
  'Order assigned to',
  'Pickup address',
  'Delivery address',
  'Price',
  'Status',
]

export default function OrdersForm() {
  const [isSeeMoreOpen, setIsSeeMoreOpen] = useState(false);
  const [search, setSearch] = useState('')

  const filteredOrders = mockOrders.filter((order) => {
    const searchValue = search.toLowerCase()

    return (
      search === '' ||
      order.id.toLowerCase().includes(searchValue) ||
      order.assignedTo.toLowerCase().includes(searchValue) ||
      order.pickupAddress.city.toLowerCase().includes(searchValue) ||
      order.pickupAddress.province.toLowerCase().includes(searchValue) ||
      order.deliveryAddress.city.toLowerCase().includes(searchValue) ||
      order.deliveryAddress.province.toLowerCase().includes(searchValue) ||
      order.status.toLowerCase().includes(searchValue)
    )
  })

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-2xl bg-white p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-[#121514]">Orders</h1>
          <span className="rounded-md border border-[#DFE2E0] px-3 py-1 text-sm text-[#121514]">10</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders"
              className="w-full rounded-xl border border-[#DFE2E0] bg-white px-3 py-2 text-sm text-[#121514] placeholder:text-[#737A76] focus:border-[#121514] focus:outline-none focus:ring-1 focus:ring-[#121514]"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737A76] cursor-pointer transition-colors hover:text-[#121514]"
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <Search className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-[#737A76]" />
            )}
          </div>
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
          <button
            className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-2 text-sm whitespace-nowrap transition-colors hover:bg-[#DCE4DF]"
            type="button"
            onClick={() =>
              exportToCSV(
                filteredOrders,
                [
                  { header: 'Order ID', value: (order) => formatOrderId(order.id) },
                  { header: 'Order assigned to', value: (order) => order.assignedTo },
                  { header: 'Pickup address', value: (order) => formatPhilippineLocation(order.pickupAddress) },
                  { header: 'Delivery address', value: (order) => formatPhilippineLocation(order.deliveryAddress) },
                  { header: 'Price', value: (order) => order.price },
                  { header: 'Status', value: (order) => order.status },
                ],
                'orders'
              )
            }
          >
            Export to CSV
          </button>
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
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length + 1} className="px-3 py-4 text-center text-sm text-[#737A76]">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
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
                  <td className="px-3 py-5 font-medium whitespace-nowrap">{formatPeso(order.price)}</td>
                  <td className="px-3 py-5 whitespace-nowrap">
                    <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${statusDotClass(order.status)}`} />
                    {order.status}
                  </td>
                  <td className="rounded-r-xl px-3 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-1.5 text-sm whitespace-nowrap" type="button" 
                      //onClick={() => setIsSeeMoreOpen(true)}
                      >
                        See more
                      </button>
                      <button aria-label={`More actions for order ${order.id}`} className="cursor-pointer rounded-xl border border-[#DFE2E0] p-1.5" type="button">
                        <Ellipsis size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex w-full justify-between gap-2">
        <span className="text-sm text-[#737A76]">
          Showing {filteredOrders.length} of {mockOrders.length} orders
        </span>
      </div>

      <SeeMoreModal onClose={() => setIsSeeMoreOpen(false)} open={isSeeMoreOpen}>
        <div className=''>

        </div>
      </SeeMoreModal>
    </section>
  )
}
