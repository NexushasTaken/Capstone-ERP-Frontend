"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import ListHeader from "@/components/ListHeader"
import OrderTypeFilterSelect from "@/components/OrderTypeFilterSelect"
import SearchInput from "@/components/SearchInput"
import PageSizeSelect from "@/components/PageSizeSelect"
import { TablePagination } from "@/components/TablePagination"
import { Button } from "@/components/ui/button"
import { usePageSize } from "@/hooks/usePageSize"
import { useUrlSearch } from "@/hooks/useUrlSearch"
import { normalizeOrderText } from "@/lib/helpers/orderHelpers"
import type { InsertOrderPayload, OrderGroup } from "@/types/order"
import { useOrderFilters } from "../_hooks/useOrderFilters"
import { useOrderMutations, useOrders, useOrderStatuses } from "../_hooks/useOrders"
import CreateOrderModal from "./CreateOrderModal"
import EditOrderModal from "./EditOrderModal"
import OrderDetailsModal from "./OrderDetailsModal"
import OrdersList from "./OrdersList"
import OrderStatusFilterSelect from "./OrderStatusFilterSelect"

export default function OrdersView() {
  const { values: filters, update } = useOrderFilters()
  const { orderType: selectedOrderTypeFilter, status: selectedOrderStatusFilter, page: currentPage } = filters
  const [search, setSearch] = useUrlSearch(filters.search, (value) => update({ search: value }))
  const [detailsOrder, setDetailsOrder] = useState<OrderGroup | null>(null)
  const [editOrder, setEditOrder] = useState<OrderGroup | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [pageSize, setPageSize] = usePageSize("orders")

  const { data, isLoading, isFetching, error } = useOrders({
    page: currentPage,
    pageSize,
    name: filters.search || undefined,
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
    update({ page })
  }

  function handleCreateOrder(payload: InsertOrderPayload) {
    setIsCreateModalOpen(false)
    mutations.addOrder.mutate(payload)
  }

  return (
    <section className="flex h-dvh w-full flex-col overflow-hidden rounded-2xl bg-background p-4 lg:p-5">
      <ListHeader
        title="Orders"
        actions={
          <>
            <Button onClick={() => setIsCreateModalOpen(true)} type="button">
              <Plus className="h-4 w-4" />
              Add order
            </Button>
          </>
        }
        search={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by product, customer, type, status or ID"
          />
        }
        filters={
          <>
            <OrderTypeFilterSelect value={selectedOrderTypeFilter} onChange={(orderType) => update({ orderType })} />
            <OrderStatusFilterSelect
              value={selectedOrderStatusFilter}
              statusOptions={statusOptions}
              disabled={orderStatusesLoading}
              onChange={(status) => update({ status })}
            />
          </>
        }
      />

      <div className="mt-5 min-h-0 flex-1 overflow-auto scrollbar-x-only">
        <OrdersList
          orders={orders}
          isLoading={isLoading}
          error={error}
          statusOptions={statusOptions}
          onSeeMore={setDetailsOrder}
          onEdit={setEditOrder}
          onChangeStatus={(orderId, orderStatusId) => mutations.updateStatus.mutate({ orderId, orderStatusId })}
        />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {orders.length} orders of {rows}
            {isFetching ? " - Updating..." : ""}
          </span>
          <PageSizeSelect
            value={pageSize}
            onChange={(size) => {
              setPageSize(size)
              goToPage(1)
            }}
          />
        </div>
        <div className="flex">
          <TablePagination currentPage={currentPage} totalPages={pageCount} onPageChange={goToPage} />
        </div>
      </div>

      <OrderDetailsModal order={detailsOrder} onClose={() => setDetailsOrder(null)} />

      {editOrder && (
        <EditOrderModal
          order={editOrder}
          disabled={mutations.updateOrder.isPending}
          onClose={() => setEditOrder(null)}
          onSubmit={mutations.updateOrder.mutateAsync}
        />
      )}

      <CreateOrderModal
        open={isCreateModalOpen}
        disabled={mutations.addOrder.isPending}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOrder}
      />
    </section>
  )
}
