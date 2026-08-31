'use client'

import { ChevronDown, Plus, Search, Trash2, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import AppModal from '@/app/components/modals/AppModal'
import CloseButton from '@/app/components/CloseButton'
import { PaginationDemo } from '@/app/components/Pagination'
import Loading from '@/app/components/loaders/Loading'
import SortPopover from '@/app/components/SortPopover'
import { fetchOrders, insertOrder } from '@/app/utils/api/orderApi'
import { fetchProducts } from '@/app/utils/api/productApi'
import { queryKeys } from '@/app/utils/api/queryKeys'
import { invalidateOrders } from '@/app/utils/api/queryInvalidation'
import { exportToCSV } from '@/app/utils/exportToCsv'
import {
  formatDate,
  formatOrderNumber,
  getOrderGroupKey,
  getOrderGroupPrimaryItem,
  getOrderGroupProductSummary,
  itemsPerPage,
  normalizeOrderText,
  orderStatusClass,
  orderStatusDotClass,
  productSelectPageSize,
  tableColumns,
  orderSortOptions,
} from '@/app/utils/helpers/orderHelpers'
import { formatPeso } from '@/app/utils/helpers/saleHelpers'
import type { InsertOrderPayloadItem, OrderGroup, OrderLineForm, OrdersSortBy } from '@/app/types/order'
import type { ProductListItem } from '@/app/types/product'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { toast } from 'sonner'

function DetailItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0">
      <span className="block text-xs text-[#737A76]">{label}</span>
      <span className="block truncate text-sm font-semibold capitalize text-[#0c0d0d]">
        {value}
      </span>
    </div>
  )
}

export default function OrdersForm() {
  const queryClient = useQueryClient()
  const [expandedOrderKey, setExpandedOrderKey] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<OrdersSortBy>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [orderForm, setOrderForm] = useState({
    orderTypeId: '',
    deliveryRiderId: '',
    customerName: '',
    pickUpAddress: '',
    deliveryAddress: '',
  })
  const [orderLines, setOrderLines] = useState<OrderLineForm[]>([
    { productId: '', quantity: '1' },
  ])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1)
    }, 400)

    return () => clearTimeout(timeout)
  }, [search])

  const ordersQueryParams = {
    page: currentPage,
    pageSize: itemsPerPage,
    name: debouncedSearch || undefined,
    filter: 0,
    statusId: 0,
    orderTypeId: 0,
  }

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.orders.all(ordersQueryParams),
    queryFn: () => fetchOrders(ordersQueryParams),
    keepPreviousData: true,
  })

  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: queryKeys.products.all({ page: 1, pageSize: productSelectPageSize }),
    queryFn: () => fetchProducts({ page: 1, pageSize: productSelectPageSize }),
    enabled: isAddModalOpen,
    keepPreviousData: true,
  })

  const addOrderMutation = useMutation({
    mutationFn: insertOrder,
    onSuccess: () => {
      toast.success('Order added successfully')
      invalidateOrders(queryClient)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add order')
    },
  })

  const orderGroups = data?.items ?? []
  const rows = data?.rows ?? 0
  const totalPages = Math.max(1, data?.pageCount ?? 1)
  const products: ProductListItem[] = productsResponse?.items ?? []
  const orderFormCanSubmit =
    Number(orderForm.orderTypeId) > 0 &&
    orderForm.deliveryRiderId.trim() !== '' &&
    Number(orderForm.deliveryRiderId) >= 0 &&
    orderForm.customerName.trim() !== '' &&
    orderForm.pickUpAddress.trim() !== '' &&
    orderForm.deliveryAddress.trim() !== '' &&
    orderLines.every((line) => Number(line.productId) > 0 && Number(line.quantity) > 0)

  const displayedOrders = [...orderGroups].sort((a, b) => {
    const first = getOrderGroupPrimaryItem(a)
    const second = getOrderGroupPrimaryItem(b)

    if (!first || !second) return 0

    switch (sortBy) {
      case 'customerName':
        return sortOrder === 'asc'
          ? first.customerName.localeCompare(second.customerName)
          : second.customerName.localeCompare(first.customerName)
      case 'quantity':
        return sortOrder === 'asc'
          ? first.quantity - second.quantity
          : second.quantity - first.quantity
      case 'amount':
        return sortOrder === 'asc' ? a.total - b.total : b.total - a.total
      case 'createdAt':
        return sortOrder === 'asc'
          ? Date.parse(first.created_At) - Date.parse(second.created_At)
          : Date.parse(second.created_At) - Date.parse(first.created_At)
      default:
        return 0
    }
  })

  function exportOrders(groups: OrderGroup[]) {
    exportToCSV(
      groups.flatMap((group) => group.orders),
      [
        { header: 'Order ID', value: (order) => formatOrderNumber(order.id) },
        { header: 'Product', value: (order) => order.productName },
        { header: 'Order type', value: (order) => normalizeOrderText(order.orderType) },
        { header: 'Status', value: (order) => normalizeOrderText(order.orderStatus) },
        { header: 'Customer', value: (order) => order.customerName },
        { header: 'Driver', value: (order) => order.driverName || 'Unassigned' },
        { header: 'Quantity', value: (order) => order.quantity },
        { header: 'Amount', value: (order) => order.amount },
        { header: 'Bundle code', value: (order) => order.bundleCode ?? '-' },
        { header: 'Pickup address', value: (order) => order.pickUpAddress ?? '-' },
        { header: 'Delivery address', value: (order) => order.deliveryAddress ?? '-' },
        { header: 'Created at', value: (order) => formatDate(order.created_At) },
      ],
      'orders'
    )
  }

  function updateOrderFormField(field: keyof typeof orderForm, value: string) {
    setOrderForm((current) => ({ ...current, [field]: value }))
  }

  function updateOrderLine(index: number, field: keyof OrderLineForm, value: string) {
    setOrderLines((current) =>
      current.map((line, lineIndex) => (lineIndex === index ? { ...line, [field]: value } : line))
    )
  }

  function resetOrderForm() {
    setOrderForm({
      orderTypeId: '',
      deliveryRiderId: '',
      customerName: '',
      pickUpAddress: '',
      deliveryAddress: '',
    })
    setOrderLines([{ productId: '', quantity: '1' }])
  }

  function handleAddOrder() {
    if (!orderFormCanSubmit) return

    const payload: InsertOrderPayloadItem[] = orderLines.map((line) => ({
      productId: Number(line.productId),
      orderTypeId: Number(orderForm.orderTypeId),
      deliveryRiderId: Number(orderForm.deliveryRiderId),
      quantity: Number(line.quantity),
      customerName: orderForm.customerName.trim(),
      pickUpAddress: orderForm.pickUpAddress.trim(),
      deliveryAddress: orderForm.deliveryAddress.trim(),
    }))

    setIsAddModalOpen(false)
    resetOrderForm()
    addOrderMutation.mutate(payload)
  }

  return (
    <section className="flex h-dvh w-full flex-col overflow-hidden rounded-2xl bg-white p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-[#121514]">Orders</h1>
          <span className="rounded-md border border-[#DFE2E0] px-3 py-1 text-sm text-[#121514]">
            {rows}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search orders"
              className="w-full rounded-xl border border-[#DFE2E0] bg-white px-3 py-2 text-sm text-[#121514] placeholder:text-[#737A76] focus:border-[#121514] focus:outline-none focus:ring-1 focus:ring-[#121514]"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#737A76] transition-colors hover:text-[#121514]"
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#737A76]" />
            )}
          </div>

          <button
            className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-2 text-sm whitespace-nowrap transition-colors hover:bg-[#DCE4DF]"
            type="button"
            onClick={() => exportOrders(displayedOrders)}
          >
            Export to CSV
          </button>
          <Button
            className="cursor-pointer rounded-xl px-3 py-2 text-sm"
            onClick={() => setIsAddModalOpen(true)}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add order
          </Button>
          <SortPopover
            value={sortBy}
            order={sortOrder}
            options={orderSortOptions}
            onChange={(value, order) => {
              setSortBy(value)
              setSortOrder(order)
            }}
          />
        </div>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-auto scrollbar-none">
        <div className="min-w-7xl">
          <div className="grid grid-cols-[120px_240px_140px_140px_200px_140px_140px_110px] lg:grid-cols-[120px_1.4fr_140px_140px_1fr_140px_140px_110px] px-3 pb-1 text-sm text-[#737A76]">
            {tableColumns.map((column) => (
              <span key={column}>{column}</span>
            ))}
            <span className="text-right">Details</span>
          </div>

          {isLoading ? (
            <div className="px-3 py-4 text-center text-sm text-[#737A76]">
              <Loading />
            </div>
          ) : error ? (
            <div className="px-3 py-4 text-center text-sm text-red-500">
              {error instanceof Error ? error.message : 'Failed to load orders'}
            </div>
          ) : displayedOrders.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-[#737A76]">
              No orders found.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {displayedOrders.map((group) => {
                const primary = getOrderGroupPrimaryItem(group)
                if (!primary) return null

                const orderKey = getOrderGroupKey(group)
                const isExpanded = expandedOrderKey === orderKey
                const statusLabel = normalizeOrderText(primary.orderStatus)

                return (
                  <Collapsible
                    className="rounded-xl bg-[#FAFBFA] text-sm text-[#121514]"
                    key={orderKey}
                    open={isExpanded}
                    onOpenChange={(open) => setExpandedOrderKey(open ? orderKey : null)}
                  >
                    <div className="grid grid-cols-[120px_240px_140px_140px_200px_140px_140px_110px] lg:grid-cols-[120px_1.4fr_140px_140px_1fr_140px_140px_110px] items-center px-3 py-5">
                      <span className="font-medium">{formatOrderNumber(primary.id)}</span>
                      <span className="truncate capitalize">{getOrderGroupProductSummary(group)}</span>
                      <span className="whitespace-nowrap capitalize">{normalizeOrderText(primary.orderType)}</span>
                      <span className={`font-medium whitespace-nowrap capitalize ${orderStatusClass(primary.orderStatus)}`}>
                        <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${orderStatusDotClass(primary.orderStatus)}`} />
                        {statusLabel}
                      </span>
                      <span className="truncate capitalize">{primary.customerName}</span>
                      <span className="whitespace-nowrap">{formatDate(primary.created_At)}</span>
                      <span className="font-medium whitespace-nowrap">{formatPeso(group.total)}</span>
                      <CollapsibleTrigger
                        className="ml-auto flex cursor-pointer items-center gap-2 rounded-xl border border-[#DFE2E0] bg-white px-3 py-1.5 text-sm whitespace-nowrap transition-all hover:bg-[#DCE4DF]"
                        type="button"
                      >
                        View
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </CollapsibleTrigger>
                    </div>

                    {isExpanded ? (
                      <div className="border-t border-[#E2E2E2] bg-white p-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <DetailItem label="Driver" value={primary.driverName || 'Unassigned'} />
                          <DetailItem label="Bundle code" value={primary.bundleCode ?? '-'} />
                          <DetailItem label="Total" value={formatPeso(group.total)} />
                          <DetailItem label="Created at" value={formatDate(primary.created_At)} />
                          <DetailItem label="Pickup address" value={primary.pickUpAddress ?? '-'} />
                          <DetailItem label="Delivery address" value={primary.deliveryAddress ?? '-'} />
                        </div>

                        <div className="mt-5 overflow-hidden rounded-lg border border-[#E2E2E2]">
                          <div className="grid grid-cols-[1fr_120px_140px_140px] bg-[#F0F1F1] px-3 py-2 text-xs text-[#737A76]">
                            <span>Product</span>
                            <span>Quantity</span>
                            <span>Amount</span>
                            <span>Bundle</span>
                          </div>
                          {group.orders.map((item) => (
                            <div className="grid grid-cols-[1fr_120px_140px_140px] border-t border-[#E2E2E2] px-3 py-3 text-sm" key={item.id}>
                              <span className="truncate capitalize">{item.productName}</span>
                              <span className="font-medium">{item.quantity}</span>
                              <span className="font-medium">{formatPeso(item.amount)}</span>
                              <span>{item.bundleCode ?? '-'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </Collapsible>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-[#737A76]">
          Showing {displayedOrders.length} of {rows} orders
        </span>

        <div className="flex">
          <PaginationDemo currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      <AppModal
        className="flex max-h-[90vh] flex-col overflow-hidden lg:max-w-2xl"
        onClose={() => setIsAddModalOpen(false)}
        open={isAddModalOpen}
      >
        <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#737A76]">New order</span>
            <span className="text-xl font-medium text-[#0c0d0d]">Add order</span>
          </div>
          <CloseButton onClick={() => setIsAddModalOpen(false)} />
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Customer name</span>
              <input
                className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                onChange={(event) => updateOrderFormField('customerName', event.target.value)}
                value={orderForm.customerName}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Order type ID</span>
              <input
                className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                min={1}
                onChange={(event) => updateOrderFormField('orderTypeId', event.target.value)}
                type="number"
                value={orderForm.orderTypeId}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Delivery rider ID</span>
              <input
                className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                min={0}
                onChange={(event) => updateOrderFormField('deliveryRiderId', event.target.value)}
                type="number"
                value={orderForm.deliveryRiderId}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Pick up address</span>
              <input
                className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                onChange={(event) => updateOrderFormField('pickUpAddress', event.target.value)}
                value={orderForm.pickUpAddress}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Delivery address</span>
            <input
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => updateOrderFormField('deliveryAddress', event.target.value)}
              value={orderForm.deliveryAddress}
            />
          </label>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase text-[#121514]">Products</span>
              <button
                className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-1.5 text-sm transition-colors hover:bg-[#DCE4DF]"
                onClick={() => setOrderLines((current) => [...current, { productId: '', quantity: '1' }])}
                type="button"
              >
                Add line
              </button>
            </div>

            {orderLines.map((line, index) => (
              <div className="grid grid-cols-1 gap-3 rounded-lg bg-[#F0F1F1] p-3 sm:grid-cols-[1fr_120px_40px]" key={index}>
                <label className="flex flex-col gap-1 text-sm text-[#121514]">
                  <span className="text-xs text-[#68716C]">Product</span>
                  <select
                    className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                    disabled={productsLoading}
                    onChange={(event) => updateOrderLine(index, 'productId', event.target.value)}
                    value={line.productId}
                  >
                    <option value="">{productsLoading ? 'Loading products...' : 'Select product'}</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-sm text-[#121514]">
                  <span className="text-xs text-[#68716C]">Quantity</span>
                  <input
                    className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                    min={1}
                    onChange={(event) => updateOrderLine(index, 'quantity', event.target.value)}
                    type="number"
                    value={line.quantity}
                  />
                </label>

                <button
                  aria-label="Remove order line"
                  className="mt-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#DFE2E0] bg-white text-[#737A76] transition-colors hover:text-[#B42318]"
                  disabled={orderLines.length === 1}
                  onClick={() => setOrderLines((current) => current.filter((_, lineIndex) => lineIndex !== index))}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
          <Button
            className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
            onClick={() => setIsAddModalOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl px-3 py-2 text-sm"
            disabled={!orderFormCanSubmit || addOrderMutation.isLoading}
            onClick={handleAddOrder}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add order
          </Button>
        </div>
      </AppModal>
    </section>
  )
}
