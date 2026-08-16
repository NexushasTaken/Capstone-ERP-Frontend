'use client'

import { Search, X, MapPin, PackageCheck, Truck, UserRound } from 'lucide-react'
import { formatOrderId, formatPhilippineLocation, orderTypeLabel, statusDotClass, statusTextClass } from '@/app/utils/orderHelpers'
import { mockOrders, orderSortOptions, orderStatusFilters } from '@/app/utils/orderMockData'
import { formatPeso } from '@/app/utils/saleHelpers'
import { exportToCSV } from '@/app/utils/exportToCsv'
import { useState } from 'react'
import SeeMoreModal from '@/app/components/modals/SeeMoreModal'
import CloseButton from '@/app/components/CloseButton'
import type { OrdersSortBy, OrderStatus } from '@/app/types/order'
import { PaginationDemo } from '@/app/components/Pagination'
import SortPopover from '@/app/components/SortPopover'
import StatusAction from '@/app/components/StatusAction'
import { editDeleteActions } from '@/app/utils/statusActionHelpers'

const tableColumns = [
  'Order ID',
  'Inventory ID',
  'Customer Name',
  'Product Name',
  'Quantity',
  'Price',
  'Order Date',
  'Status'
]

export default function OrdersForm() {
  const [isSeeMoreOpen, setIsSeeMoreOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<(typeof mockOrders)[number] | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<'All' | OrderStatus>('All')
  const [sortBy, setSortBy] = useState<OrdersSortBy>('orderDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredOrders = mockOrders.filter((order) => {
    const searchValue = search.toLowerCase()
    const matchesFilter = selectedFilter === 'All' || order.status === selectedFilter
    const matchesSearch =
      search === '' ||
      order.id.toLowerCase().includes(searchValue) ||
      order.inventoryId.toLowerCase().includes(searchValue) ||
      order.customerName.toLowerCase().includes(searchValue) ||
      order.productName.toLowerCase().includes(searchValue) ||
      order.orderDate.toLowerCase().includes(searchValue) ||
      order.assignedTo.toLowerCase().includes(searchValue) ||
      order.pickupAddress.city.toLowerCase().includes(searchValue) ||
      order.pickupAddress.province.toLowerCase().includes(searchValue) ||
      order.deliveryAddress.city.toLowerCase().includes(searchValue) ||
      order.deliveryAddress.province.toLowerCase().includes(searchValue) ||
      order.orderType.toLowerCase().includes(searchValue) ||
      order.status.toLowerCase().includes(searchValue)

    return matchesFilter && matchesSearch
  })

  const displayedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'customerName':
        return sortOrder === 'asc'
          ? a.customerName.localeCompare(b.customerName)
          : b.customerName.localeCompare(a.customerName)

      case 'productName':
        return sortOrder === 'asc'
          ? a.productName.localeCompare(b.productName)
          : b.productName.localeCompare(a.productName)

      case 'quantity':
        return sortOrder === 'asc'
          ? a.quantity - b.quantity
          : b.quantity - a.quantity

      case 'price':
        return sortOrder === 'asc'
          ? a.price - b.price
          : b.price - a.price

      case 'status':
        return sortOrder === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status)

      case 'orderDate':
        return sortOrder === 'asc'
          ? Date.parse(a.orderDate) - Date.parse(b.orderDate)
          : Date.parse(b.orderDate) - Date.parse(a.orderDate)

      default:
        return 0
    }
  })

  const totalPages = Math.ceil(displayedOrders.length / itemsPerPage)
  const paginatedOrders = displayedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const selectedStatusClass = selectedOrder ? statusTextClass(selectedOrder.status) : ''

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-2xl bg-white p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-[#121514]">Orders</h1>
          <span className="rounded-md border border-[#DFE2E0] px-3 py-1 text-sm text-[#121514]">{mockOrders.length}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search orders"
              className="w-full rounded-xl border border-[#DFE2E0] bg-white px-3 py-2 text-sm text-[#121514] placeholder:text-[#737A76] focus:border-[#121514] focus:outline-none focus:ring-1 focus:ring-[#121514]"
            />
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setCurrentPage(1)
                }}
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
              className={`cursor-pointer rounded-xl border px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                selectedFilter === filter.label
                  ? 'border-[#121514] bg-[#121514] text-white'
                  : 'border-[#E1E4E2] bg-white text-[#121514] hover:bg-[#DCE4DF]'
              }`}
              key={filter.label}
              type="button"
              onClick={() => {
                setSelectedFilter(filter.label)
                setCurrentPage(1)
              }}
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
                  { header: 'Inventory ID', value: (order) => order.inventoryId },
                  { header: 'Customer name', value: (order) => order.customerName },
                  { header: 'Product name', value: (order) => order.productName },
                  { header: 'Quantity', value: (order) => order.quantity },
                  { header: 'Price', value: (order) => order.price },
                  { header: 'Order date', value: (order) => order.orderDate },
                  { header: 'Order type', value: (order) => order.orderType },
                  { header: 'Order assigned to', value: (order) => order.assignedTo },
                  { header: 'Pickup address', value: (order) => formatPhilippineLocation(order.pickupAddress) },
                  { header: 'Delivery address', value: (order) => formatPhilippineLocation(order.deliveryAddress) },
                  { header: 'Status', value: (order) => order.status },
                ],
                'orders'
              )
            }
          >
            Export to CSV
          </button>
          <SortPopover
            value={sortBy}
            order={sortOrder}
            options={orderSortOptions}
            onChange={(value, order) => {
              setSortBy(value)
              setSortOrder(order)
              setCurrentPage(1)
            }}
          />
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
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length + 1} className="px-3 py-4 text-center text-sm text-[#737A76]">
                  No orders found.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={order.id}>
                  <td className="rounded-l-xl px-3 py-5 font-medium">{formatOrderId(order.id)}</td>
                  <td className="px-3 py-5 font-medium whitespace-nowrap">{order.inventoryId}</td>
                  <td className="px-3 py-5 font-medium whitespace-nowrap">{order.customerName}</td>
                  <td className="px-3 py-5 whitespace-nowrap">{order.productName}</td>
                  <td className="px-3 py-5 font-medium">{order.quantity}</td>
                  <td className="px-3 py-5 font-medium whitespace-nowrap">{formatPeso(order.price)}</td>
                  <td className="px-3 py-5 whitespace-nowrap">{order.orderDate}</td>
                  <td className={`px-3 py-5 font-medium whitespace-nowrap ${statusTextClass(order.status)}`}>
                    <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${statusDotClass(order.status)}`} />
                    {order.status}
                  </td>
                  <td className="rounded-r-xl px-3 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-1.5 text-sm whitespace-nowrap transition-all hover:bg-[#DCE4DF]" type="button" 
                      onClick={() => {
                        setSelectedOrder(order)
                        setIsSeeMoreOpen(true)
                      }}
                      >
                        See more
                      </button>
                      <StatusAction
                        actions={editDeleteActions}
                        label={`More actions for order ${order.id}`}
                        onAction={() => {
                          setSelectedOrder(order)
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-[#737A76]">
          Showing {paginatedOrders.length} of {displayedOrders.length} orders
        </span>

        <div className="flex">
          <PaginationDemo
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <SeeMoreModal onClose={() => setIsSeeMoreOpen(false)} open={isSeeMoreOpen} className="flex h-full flex-col lg:max-h-[70vh]">
        <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
          <div className="flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs">{selectedOrder ? formatOrderId(selectedOrder.id) : ''}</span>
              {selectedOrder && (
                <span className={`inline-flex items-center gap-1 text-sm font-medium ${selectedStatusClass}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(selectedOrder.status)}`} />
                  {selectedOrder.status}
                </span>
              )}
            </div>
            <span className="text-xl font-medium text-[#0c0d0d]">{selectedOrder?.productName}</span>
          </div>
          <CloseButton onClick={() => setIsSeeMoreOpen(false)} />
        </div>

        <div className="flex h-full w-full flex-col overflow-y-auto p-4">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex h-16 w-full items-center gap-2 rounded-lg bg-[#F0F1F1] px-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B1C1C]">
                <UserRound className="h-6 w-6 text-[#777777]" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-xs">Order assigned to</span>
                <span className="truncate text-base font-semibold">{selectedOrder?.assignedTo}</span>
              </div>
            </div>

            <div className="flex h-16 w-full items-center gap-2 rounded-lg bg-[#F0F1F1] px-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B1C1C]">
                <Truck className="h-6 w-6 text-[#777777]" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-xs">Order type</span>
                <span className="truncate text-base font-semibold">{selectedOrder ? orderTypeLabel(selectedOrder.orderType) : ''}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <span className="text-xs uppercase text-[#121514]">Order addresses</span>
            <div className="h-px w-full border-b border-[#E2E2E2]" />
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-start gap-3 rounded-xl border border-[#E2E2E2] bg-white p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF3ED] text-[#31723B]">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-xs text-[#737A76]">Delivery address</span>
                <span className="text-sm font-medium text-[#0c0d0d]">
                  {selectedOrder ? formatPhilippineLocation(selectedOrder.deliveryAddress) : ''}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-[#E2E2E2] bg-white p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6EFE6] text-[#7A4E22]">
                <PackageCheck className="h-5 w-5" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-xs text-[#737A76]">Pick up address</span>
                <span className="text-sm font-medium text-[#0c0d0d]">
                  {selectedOrder ? formatPhilippineLocation(selectedOrder.pickupAddress) : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <span className="text-xs uppercase text-[#121514]">Order summary</span>
            <div className="h-px w-full border-b border-[#E2E2E2]" />
          </div>

          <div className="mt-4 rounded-xl bg-[#F0F1F1] p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-[#737A76]">Customer</span>
                <span className="font-semibold text-[#0c0d0d]">{selectedOrder?.customerName}</span>
              </div>
              <div>
                <span className="block text-xs text-[#737A76]">Inventory ID</span>
                <span className="font-semibold text-[#0c0d0d]">{selectedOrder?.inventoryId}</span>
              </div>
              <div>
                <span className="block text-xs text-[#737A76]">Quantity</span>
                <span className="font-semibold text-[#0c0d0d]">{selectedOrder?.quantity}</span>
              </div>
              <div>
                <span className="block text-xs text-[#737A76]">Price</span>
                <span className="font-semibold text-[#0c0d0d]">{selectedOrder ? formatPeso(selectedOrder.price) : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </SeeMoreModal>
    </section>
  )
}
