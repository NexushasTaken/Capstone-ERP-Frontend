'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import ExportCsvButton from '@/components/ExportCsvButton'
import OrderTypeFilterSelect from '@/components/OrderTypeFilterSelect'
import PageTitle from '@/components/PageTitle'
import SearchInput from '@/components/SearchInput'
import { TablePagination } from '@/components/TablePagination'
import { Button } from '@/components/ui/button'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { exportToCSV } from '@/lib/exportToCsv'
import { formatDate } from '@/lib/format'
import { formatOrderNumber, normalizeOrderText } from '@/lib/helpers/orderHelpers'
import type { InsertOrderPayload, OrderGroup } from '@/types/order'
import { useOrderMutations, useOrders, useOrderStatuses } from '../_hooks/useOrders'
import CreateOrderModal from './CreateOrderModal'
import OrdersList from './OrdersList'
import OrderStatusFilterSelect from './OrderStatusFilterSelect'

const PAGE_SIZE = 10

export default function OrdersView() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrderTypeFilter, setSelectedOrderTypeFilter] = useState('')
  const [selectedOrderStatusFilter, setSelectedOrderStatusFilter] = useState('')
  const [expandedOrderKey, setExpandedOrderKey] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search.trim())

  const { data, isLoading, isFetching, error } = useOrders({
    page: currentPage,
    pageSize: PAGE_SIZE,
    name: debouncedSearch || undefined,
    orderTypeId: selectedOrderTypeFilter ? Number(selectedOrderTypeFilter) : 0,
    statusId: selectedOrderStatusFilter ? Number(selectedOrderStatusFilter) : 0,
  })
  const { data: orderStatuses = [], isLoading: orderStatusesLoading } = useOrderStatuses()
  const mutations = useOrderMutations()

  const orders = data?.items ?? []
  const rows = data?.rows ?? 0
  const pageCount = Math.max(1, data?.pageCount ?? 1)
  const statusOptions = orderStatuses.map((orderStatus) => ({
    id: orderStatus.id,
    label: normalizeOrderText(orderStatus.status),
  }))

  function goToPage(page: number) {
    setCurrentPage(page)
    setExpandedOrderKey(null)
  }

  function handleCreateOrder(payload: InsertOrderPayload) {
    setIsCreateModalOpen(false)
    mutations.addOrder.mutate(payload)
  }

  return (
    <section className="flex h-dvh w-full flex-col overflow-hidden rounded-2xl bg-white p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <PageTitle title="Orders" count={rows} />

        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            placeholder="Search orders"
          />

          <OrderTypeFilterSelect
            value={selectedOrderTypeFilter}
            onChange={(orderTypeId) => {
              setSelectedOrderTypeFilter(orderTypeId)
              setCurrentPage(1)
            }}
          />

          <OrderStatusFilterSelect
            value={selectedOrderStatusFilter}
            statusOptions={statusOptions}
            disabled={orderStatusesLoading}
            onChange={(statusId) => {
              setSelectedOrderStatusFilter(statusId)
              goToPage(1)
            }}
          />

          <ExportCsvButton
            disabled={isFetching || !!error || orders.length === 0}
            onExport={() => exportOrders(orders)}
          />
          <Button
            className="cursor-pointer rounded-xl px-3 py-2 text-sm"
            onClick={() => setIsCreateModalOpen(true)}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add order
          </Button>
        </div>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-auto scrollbar-none">
        <OrdersList
          orders={orders}
          isLoading={isLoading}
          error={error}
          statusOptions={statusOptions}
          expandedOrderKey={expandedOrderKey}
          onExpandedOrderChange={setExpandedOrderKey}
          onChangeStatus={(orderId, orderStatusId) => mutations.updateStatus.mutate({ orderId, orderStatusId })}
        />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-[#737A76]">
          Showing {orders.length} orders of {rows}
          {isFetching ? ' - Updating...' : ''}
        </span>
        <div className="flex">
          <TablePagination currentPage={currentPage} totalPages={pageCount} onPageChange={goToPage} />
        </div>
      </div>

      <CreateOrderModal
        open={isCreateModalOpen}
        disabled={mutations.addOrder.isPending}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOrder}
      />
    </section>
  )
}

// One CSV row per product line, with the order's details repeated on each.
function exportOrders(groups: OrderGroup[]) {
  exportToCSV(
    groups.flatMap((group) => group.orders.map((line) => ({ ...group, ...line }))),
    [
      { header: 'Order ID', value: (order) => formatOrderNumber(order.orderId) },
      { header: 'Product', value: (order) => order.productName },
      { header: 'Order type', value: (order) => normalizeOrderText(order.orderType) },
      { header: 'Status', value: (order) => normalizeOrderText(order.orderStatus) },
      { header: 'Customer', value: (order) => order.customerName },
      { header: 'Driver', value: (order) => order.driverName || 'Unassigned' },
      { header: 'Quantity', value: (order) => order.quantity },
      { header: 'Amount', value: (order) => order.totalAmount },
      { header: 'Pickup address', value: (order) => order.pickUpAddress ?? '-' },
      { header: 'Delivery address', value: (order) => order.deliveryAddress ?? '-' },
      { header: 'Created at', value: (order) => formatDate(order.created_At) },
    ],
    'orders'
  )
}
