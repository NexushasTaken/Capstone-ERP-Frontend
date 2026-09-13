'use client'

import { Spinner } from '@/components/ui/spinner'

import { ChevronDown, Plus, Search, Trash2, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import AppModal from '@/app/components/modals/AppModal'
import CloseButton from '@/app/components/CloseButton'
import EntityDropdown from '@/app/components/EntityDropdown'
import Loading from '@/app/components/loaders/Loading'
import { PaginationDemo } from '@/app/components/Pagination'
import StatusAction from '@/app/components/StatusAction'
import {
  fetchOrders,
  fetchOrderRiders,
  fetchOrderStatuses,
  fetchOrderTypes,
  insertOrder,
  updateOrderStatus,
} from '@/app/services/orderApi'
import { fetchProducts } from '@/app/services/productApi'
import { queryKeys } from '@/app/utils/query/queryKeys'
import { invalidateOrders } from '@/app/utils/query/queryInvalidation'
import { exportToCSV } from '@/app/utils/exportToCsv'
import {
  formatDate,
  formatOrderNumber,
  getOrderGroupKey,
  getOrderGroupProductSummary,
  getOrderLineAmountTotal,
  getOrderLineQuantityTotal,
  getOrderLineRows,
  normalizeOrderText,
  orderStatusClass,
  orderStatusDotClass,
  productSelectPageSize,
  tableColumns,
} from '@/app/utils/helpers/orderHelpers'
import { formatPeso } from '@/app/utils/helpers/saleHelpers'
import type { OrderGroup, OrderLineForm } from '@/app/types/order'
import type { InsertOrderPayloadItem } from '@/app/utils/api/types/order'
import type { ProductListItem } from '@/app/types/product'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  const [exportCooldown, setExportCooldown] = useState(0)

  useEffect(() => {
    if (exportCooldown <= 0) return

    const timer = setTimeout(() => {
      setExportCooldown((previous) => previous - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [exportCooldown])

  const queryClient = useQueryClient()
  const [expandedOrderKey, setExpandedOrderKey] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedOrderTypeFilter, setSelectedOrderTypeFilter] = useState('')
  const [selectedOrderStatusFilter, setSelectedOrderStatusFilter] = useState('')
  const [isConfirmAddModalOpen, setIsConfirmAddModalOpen] = useState(false)
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
      setDebouncedSearch(search.trim())
      setCurrentPage(1)
    }, 400)

    return () => clearTimeout(timeout)
  }, [search])

  const ordersQueryParams = {
    page: currentPage,
    pageSize,
    name: debouncedSearch || undefined,
    orderTypeId: selectedOrderTypeFilter ? Number(selectedOrderTypeFilter) : 0,
    statusId: selectedOrderStatusFilter ? Number(selectedOrderStatusFilter) : 0,
  }

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: queryKeys.orders.all(ordersQueryParams),
    queryFn: ({ signal }) => fetchOrders(ordersQueryParams, signal),
    staleTime: 0,
    keepPreviousData: true,
  })

  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: queryKeys.products.all({ page: 1, pageSize: productSelectPageSize }),
    queryFn: () => fetchProducts({ page: 1, pageSize: productSelectPageSize }),
    enabled: isAddModalOpen,
    keepPreviousData: true,
  })

  const { data: orderTypes = [], isLoading: orderTypesLoading } = useQuery({
    queryKey: queryKeys.orders.types,
    queryFn: fetchOrderTypes,
  })

  const { data: orderStatuses = [], isLoading: orderStatusesLoading } = useQuery({
    queryKey: queryKeys.orders.statuses,
    queryFn: fetchOrderStatuses,
  })

  const { data: orderRiders = [], isLoading: orderRidersLoading } = useQuery({
    queryKey: queryKeys.orders.riders,
    queryFn: fetchOrderRiders,
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

  const updateOrderStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      toast.success('Order status updated successfully')
      invalidateOrders(queryClient)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update order status')
    },
  })

  const orderGroups = data?.items ?? []
  const rows = data?.rows ?? 0
  const pageCount = Math.max(1, data?.pageCount ?? 1)
  const products: ProductListItem[] = productsResponse?.items ?? []
  const orderTypeOptions = orderTypes.map((orderType) => ({
    id: orderType.id,
    label: normalizeOrderText(orderType.type),
  }))
  const isWalkinSelected =
  orderTypeOptions
    .find((type) => type.id === Number(orderForm.orderTypeId))
    ?.label.toLowerCase() === 'walkin'
  const orderStatusOptions = orderStatuses.map((orderStatus) => ({
    id: orderStatus.id,
    label: normalizeOrderText(orderStatus.status),
  }))
  const orderStatusFilterSelectItems = [
    { value: 'all', label: 'All statuses' },
    ...orderStatusOptions.filter((status) => status.label.toLowerCase() !== 'completed').map((status) => ({
      value: String(status.id),
      label: status.label,
    })),
  ]
  const orderTypeSelectItems = orderTypeOptions.map((orderType) => ({
    value: String(orderType.id),
    label: orderType.label,
  }))
  const orderTypeFilterSelectItems = [
    { value: 'all', label: 'All types' },
    ...orderTypeSelectItems,
  ]
  const orderRiderOptions = orderRiders.map((rider) => ({
    id: rider.id,
    label: `${rider.firstName} ${rider.lastName}`,
  }))
  const selectedOrderRiderLabel = (() => {
    const rider = orderRiders.find((item) => item.id === Number(orderForm.deliveryRiderId))
    return rider ? `${rider.firstName} ${rider.lastName}` : ''
  })()
  const productOptions = products.map((product) => ({
    id: product.id,
    label: product.name,
    sublabel: `ID: ${product.id}`,
  }))
  const orderLineRows = getOrderLineRows(orderLines, products)
  const totalOrderQuantity = getOrderLineQuantityTotal(orderLineRows)
  const totalOrderAmount = getOrderLineAmountTotal(orderLineRows)
  const orderFormCanSubmit =
    Number(orderForm.orderTypeId) > 0 &&
    orderForm.deliveryRiderId.trim() !== '' &&
    Number(orderForm.deliveryRiderId) >= 0 &&
    orderForm.customerName.trim() !== '' &&
    orderForm.pickUpAddress.trim() !== '' &&
    orderForm.deliveryAddress.trim() !== '' &&
    orderLines.every((line) => Number(line.productId) > 0 && Number(line.quantity) > 0)

  const displayedOrders = orderGroups

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

  function updateOrderFormField(field: keyof typeof orderForm, value: string) {
    setOrderForm((current) => ({ ...current, [field]: value }))
  }

  function updateOrderLine(index: number, field: keyof OrderLineForm, value: string) {
    setOrderLines((current) =>
      current.map((line, lineIndex) => (lineIndex === index ? { ...line, [field]: value } : line))
    )
  }

  function updateOrderTypeFilter(orderTypeId: number) {
    setCurrentPage(1)
    setSelectedOrderTypeFilter(orderTypeId === 0 ? '' : String(orderTypeId))
  }

  function handleUpdateOrderStatus(orderId: number, orderStatusId: string) {
    if (!orderStatusId) return
    updateOrderStatusMutation.mutate({
      orderId,
      orderStatusId: Number(orderStatusId),
    })
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
    setIsConfirmAddModalOpen(false)
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
            <Input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search orders"
              className="w-full rounded-xl border border-[#DFE2E0] bg-white px-3 
              py-2 text-sm text-[#121514] placeholder:text-[#737A76] focus:border-[#121514] 
              focus:outline-none focus:ring-1 focus:ring-[#121514]"
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

          <div className="w-48">
            <Select
              disabled={orderTypesLoading}
              items={orderTypeFilterSelectItems}
              onValueChange={(value) => updateOrderTypeFilter(value === 'all' ? 0 : Number(value ?? 0))}
              value={selectedOrderTypeFilter || 'all'}
            >
              <SelectTrigger className="h-10 w-full rounded-xl 
              border-[#DFE2E0] bg-white px-3 text-sm focus-visible:border-[#121514] focus-visible:ring-[#121514]/20">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {orderTypeOptions.map((orderType) => (
                  <SelectItem key={orderType.id} value={String(orderType.id)} className="capitalize">
                    {orderType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <Select
              disabled={orderStatusesLoading}
              items={orderStatusFilterSelectItems}
              onValueChange={(value) => {
                setSelectedOrderStatusFilter(value === 'all' ? '' : String(value ?? ''))
                setCurrentPage(1)
                setExpandedOrderKey(null)
              }}
              value={selectedOrderStatusFilter || 'all'}
            >
              <SelectTrigger aria-label="Filter orders by status" className="h-10 w-full rounded-xl border-[#DFE2E0] bg-white px-3 text-sm focus-visible:border-[#121514] focus-visible:ring-[#121514]/20">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {orderStatusFilterSelectItems.map((status) => (
                  <SelectItem key={status.value} value={status.value} className="capitalize">
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            className={`h-auto rounded-xl border border-[#DFE2E0] px-3 py-2 text-sm whitespace-nowrap transition-colors ${exportCooldown > 0 ? "bg-gray-100 cursor-not-allowed text-gray-500" : "hover:bg-[#DCE4DF] cursor-pointer text-black"}`}
            disabled={exportCooldown > 0 || isFetching || !!error || displayedOrders.length === 0}
            type="button"
            onClick={() => {
              exportOrders(displayedOrders)
              setExportCooldown(10)
            }}
          >
            {exportCooldown > 0 ? (
              <>
                <Spinner data-icon="inline-start" />
                Cooldown
              </>
            ) : 'Export page to CSV'}
          </Button>
          <Button
            className="cursor-pointer rounded-xl px-3 py-2 text-sm"
            onClick={() => setIsAddModalOpen(true)}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add order
          </Button>
        </div>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-auto scrollbar-none">
        <div className="min-w-7xl">
          <div className="grid grid-cols-[120px_240px_140px_140px_200px_140px_140px_130px] 
          lg:grid-cols-[120px_1.4fr_140px_140px_1fr_140px_140px_160px] px-3 pb-1 text-sm text-[#737A76]">
            {tableColumns.map((column) => (
              <span key={column}>{column}</span>
            ))}
            <span className="text-right">Action</span>
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
                const primary = group
                if (!primary) return null

                const orderKey = getOrderGroupKey(group)
                const isExpanded = expandedOrderKey === orderKey
                const statusLabel = normalizeOrderText(primary.orderStatus)
                const isWalkinOrder = normalizeOrderText(primary.orderType).toLowerCase() === 'walkin'
                const orderStatusActions = orderStatusOptions
                  .filter((status) => !(isWalkinOrder && status.label.toLowerCase() === 'shipped'))
                  .map((status) => ({
                    label: status.label,
                    value: String(status.id),
                  }))

                return (
                  <Collapsible
                    className="rounded-xl bg-[#FAFBFA] text-sm text-[#121514]"
                    key={orderKey}
                    open={isExpanded}
                    onOpenChange={(open) => setExpandedOrderKey(open ? orderKey : null)}
                  >
                    <div className="grid grid-cols-[120px_240px_140px_140px_200px_140px_140px_130px] 
                    lg:grid-cols-[120px_1.4fr_140px_140px_1fr_140px_140px_160px] items-center px-3 py-5">
                      <span className="font-medium">{formatOrderNumber(primary.orderId)}</span>
                      <span className="truncate capitalize">{getOrderGroupProductSummary(group)}</span>
                      <span className="whitespace-nowrap capitalize">{normalizeOrderText(primary.orderType)}</span>
                      <span className={`font-medium whitespace-nowrap capitalize ${orderStatusClass(primary.orderStatus)}`}>
                        <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${orderStatusDotClass(primary.orderStatus)}`} />
                        {statusLabel}
                      </span>
                      <span className="truncate capitalize">{primary.customerName}</span>
                      <span className="whitespace-nowrap">{formatDate(primary.created_At)}</span>
                      <span className="font-medium whitespace-nowrap">{formatPeso(group.total)}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <CollapsibleTrigger
                          className="flex cursor-pointer items-center gap-2 rounded-xl border 
                          border-[#DFE2E0] bg-white px-3 py-1.5 text-sm whitespace-nowrap transition-all hover:bg-[#DCE4DF]"
                          type="button"
                        >
                          View
                          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </CollapsibleTrigger>
                        {statusLabel.trim().toLowerCase() !== 'cancelled' && (
                          <StatusAction
                            actions={orderStatusActions}
                            label="Order actions"
                            onAction={(statusId) => handleUpdateOrderStatus(primary.orderId, statusId)}
                          />
                        )}
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="border-t border-[#E2E2E2] bg-white p-4">
                        <div className="grid gap-4 grid-cols-4">
                          <DetailItem label="Driver" value={primary.driverName || 'Unassigned'} />
                          <DetailItem label="Total" value={formatPeso(group.total)} />
                          <DetailItem label="Created at" value={formatDate(primary.created_At)} />
                          <DetailItem label="Pickup address" value={primary.pickUpAddress ?? '-'} />
                          <DetailItem label="Delivery address" value={primary.deliveryAddress ?? '-'} />
                        </div>

                        <div className="mt-5 rounded-lg border border-[#E2E2E2] overflow-auto max-h-80 scrollbar-none">
                          <div className="sticky top-0 grid grid-cols-[1fr_120px_120px_140px_140px] 
                          bg-[#F0F1F1] px-3 py-2 text-xs text-[#737A76]">
                            <span>Product</span>
                            <span>Order ID</span>
                            <span>Quantity</span>
                            <span>Amount</span>
                            <span>Unit price</span>
                          </div>
                          {group.orders.map((item, index) => (
                            <div className="grid grid-cols-[1fr_120px_120px_140px_140px] border-t 
                            border-[#E2E2E2] px-3 py-3 text-sm" key={`${group.orderId}-${index}`}>
                              <span className="truncate capitalize">{item.productName}</span>
                              <span className="truncate capitalize font-medium">{formatOrderNumber(group.orderId)}</span>
                              <span className="font-medium">{item.quantity}</span>
                              <span className="font-medium">{formatPeso(item.totalAmount)}</span>
                              <span>{formatPeso(item.price)}</span>
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
          Showing {displayedOrders.length} orders of {rows}
          {isFetching ? ' - Updating...' : ''}
        </span>
        <div className="flex">
          <PaginationDemo
            currentPage={currentPage}
            totalPages={pageCount}
            onPageChange={(page) => {
              setCurrentPage(page)
              setExpandedOrderKey(null)
            }}
          />
        </div>
      </div>

      <AppModal
        className="flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-6xl flex-col overflow-hidden lg:max-w-6xl"
        onClose={() => setIsAddModalOpen(false)}
        open={isAddModalOpen}
      >
        <div className="flex w-full items-center justify-between gap-4 border-b border-[#E2E2E2] p-5">
            <div className="flex min-w-0 flex-col">
              <span className="text-xs text-[#737A76]">New order</span>
              <span className="text-2xl font-medium tracking-tight text-[#0c0d0d]">Create order</span>
            </div>
          <CloseButton onClick={() => setIsAddModalOpen(false)} />
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          <div className="flex flex-col bg-white">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex flex-col gap-1 text-sm text-[#121514]">
                <span className="text-xs text-[#68716C]">Order type</span>
                <Select
                  disabled={orderTypesLoading}
                  items={orderTypeSelectItems}
                  onValueChange={(value) => updateOrderFormField('orderTypeId', value ?? '')}
                  value={orderForm.orderTypeId}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl border-[#DFE2E0] 
                  bg-white px-3 text-sm focus-visible:border-[#121514] focus-visible:ring-[#121514]/20">
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent className="capitalize">
                    {orderTypeOptions.map((orderType) => (
                      <SelectItem key={orderType.id} value={String(orderType.id)} className="capitalize">
                        {orderType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              
              {!isWalkinSelected && (
                <label className="flex flex-col gap-1 text-sm text-[#121514]">
                  <span className="text-xs text-[#68716C]">Delivery rider</span>
                  <EntityDropdown
                    emptyLabel="No riders found."
                    isLoading={orderRidersLoading}
                    onSelect={(riderId) => updateOrderFormField('deliveryRiderId', String(riderId))}
                    options={orderRiderOptions}
                    placeholder="Select delivery rider"
                    searchPlaceholder="Search riders..."
                    value={selectedOrderRiderLabel}
                  />
                </label>
              )}

              <label className="flex flex-col gap-1 text-sm text-[#121514]">
                <span className="text-xs text-[#68716C]">Customer name</span>
                <Input
                  className="capitalize h-10 rounded-xl border border-[#DFE2E0] 
                  bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                  onChange={(event) => updateOrderFormField('customerName', event.target.value)}
                  value={orderForm.customerName}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-[#121514]">
                <span className="text-xs text-[#68716C]">Quantity (total items)</span>
                <Input
                  className="h-10 rounded-xl border border-[#DFE2E0] bg-[#F7F8F8] px-3 text-sm text-[#121514] outline-none"
                  readOnly
                  disabled
                  value={totalOrderQuantity}
                />
                <span className="text-xs text-[#737A76]">Calculated from items below</span>
              </label>
            </div>
            
            {!isWalkinSelected && (
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-[#121514]">
                  <span className="text-xs text-[#68716C]">Pick up address</span>
                  <Input
                    className="h-10 rounded-xl border border-[#DFE2E0] 
                    bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                    onChange={(event) => updateOrderFormField('pickUpAddress', event.target.value)}
                    value={orderForm.pickUpAddress}
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-[#121514]">
                  <span className="text-xs text-[#68716C]">Delivery address</span>
                  <Input
                    className="h-10 rounded-xl border border-[#DFE2E0] 
                    bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                    onChange={(event) => updateOrderFormField('deliveryAddress', event.target.value)}
                    value={orderForm.deliveryAddress}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-medium text-[#0c0d0d]">Order items</span>
                <span className="text-sm text-[#737A76]">Add one or more products to this order.</span>
              </div>
              <Button
                className="w-full rounded-xl px-3 py-2 text-sm sm:w-auto"
                onClick={() => setOrderLines((current) => [...current, { productId: '', quantity: '1' }])}
                type="button"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                Add product
              </Button>
            </div>

            <div className="overflow-auto max-h-96 rounded-xl border border-[#DFE2E0]">
              <Table>
                <TableHeader className="bg-[#F7F8F8]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-14 text-center text-[#121514]">#</TableHead>
                    <TableHead className="min-w-72 text-[#121514]">Product</TableHead>
                    <TableHead className="w-36 text-center text-[#121514]">Unit price</TableHead>
                    <TableHead className="w-40 text-center text-[#121514]">Quantity</TableHead>
                    <TableHead className="w-36 text-center text-[#121514]">Subtotal</TableHead>
                    <TableHead className="w-24 text-center text-[#121514]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderLineRows.map((line, index) => (
                    <TableRow className="hover:bg-[#F7F8F8]" key={index}>
                      <TableCell className="text-center font-medium text-[#121514]">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <EntityDropdown
                            emptyLabel="No products found"
                            isLoading={productsLoading}
                            onSelect={(productId) => updateOrderLine(index, 'productId', String(productId))}
                            options={productOptions.filter(
                              (product) =>
                                !orderLines.some(
                                  (otherLine, otherIndex) =>
                                    otherIndex !== index &&
                                    Number(otherLine.productId) === product.id
                                )
                            )}
                            placeholder="Select product"
                            searchPlaceholder="Search products..."
                            value={line.product?.name ?? ''}
                          />
                          {line.product ? (
                            <span className="text-xs text-[#737A76]">ID: {line.product.id}</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-[#121514]">{formatPeso(line.unitPrice)}</TableCell>
                      <TableCell>
                        <Input
                          className="mx-auto h-10 w-28 rounded-xl 
                          border border-[#DFE2E0] bg-white 
                          px-3 text-center text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                          min={1}
                          onChange={(event) => updateOrderLine(index, 'quantity', event.target.value)}
                          type="number"
                          value={line.quantity || ''}
                        />
                      </TableCell>
                      <TableCell className="text-center font-medium text-[#121514]">{formatPeso(line.subtotal)}</TableCell>
                      <TableCell className="text-center">
                        <button
                          aria-label="Remove order line"
                          className="inline-flex h-10 w-10 cursor-pointer 
                          items-center justify-center rounded-xl 
                          border border-[#F4B2B2] bg-white text-[#D92D20] transition-colors hover:bg-[#FFF4F4]"
                          disabled={orderLines.length === 1}
                          onClick={() => setOrderLines((current) => current.filter((_, lineIndex) => lineIndex !== index))}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter className="border-t border-[#DFE2E0] bg-white">
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="text-right text-sm font-semibold uppercase text-[#121514]" colSpan={4}>
                      Total
                    </TableCell>
                    <TableCell className="text-center text-base font-medium text-[#159947]">
                      {formatPeso(totalOrderAmount)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-5">
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
            onClick={() => setIsConfirmAddModalOpen(true)}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add order
          </Button>
        </div>
      </AppModal>

      <AppModal
        className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl flex-col overflow-hidden lg:max-w-4xl"
        onClose={() => {
          setIsConfirmAddModalOpen(false)
        }}
        open={isConfirmAddModalOpen}
      >
        <div className="flex w-full items-center justify-between gap-4 border-b border-[#E2E2E2] p-5">
          <div className="flex flex-col">
            <span className="text-xs text-[#737A76]">Confirm order</span>
            <span className="text-2xl font-medium tracking-tight text-[#0c0d0d]">Review order details</span>
          </div>
          <CloseButton
            onClick={() => {
              setIsConfirmAddModalOpen(false)
            }}
          />
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#DFE2E0] p-4 md:grid-cols-2 xl:grid-cols-3">
            <DetailItem
              label="Order type"
              value={orderTypeOptions.find((item) => item.id === Number(orderForm.orderTypeId))?.label ?? '-'}
            />
            <DetailItem label="Delivery rider" value={selectedOrderRiderLabel || '-'} />
            <DetailItem label="Customer" value={orderForm.customerName || '-'} />
            <DetailItem label="Quantity" value={totalOrderQuantity} />
            <DetailItem label="Pickup address" value={orderForm.pickUpAddress || '-'} />
            <DetailItem label="Delivery address" value={orderForm.deliveryAddress || '-'} />
          </div>

          <div className="overflow-auto rounded-xl border border-[#DFE2E0]">
            <Table>
              <TableHeader className="bg-[#F7F8F8]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-14 text-center text-[#121514]">#</TableHead>
                  <TableHead className="min-w-72 text-[#121514]">Product</TableHead>
                  <TableHead className="w-36 text-center text-[#121514]">Unit price</TableHead>
                  <TableHead className="w-36 text-center text-[#121514]">Quantity</TableHead>
                  <TableHead className="w-36 text-center text-[#121514]">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderLineRows.map((line, index) => (
                  <TableRow className="hover:bg-[#F7F8F8]" key={`${line.productId}-${index}`}>
                    <TableCell className="text-center font-medium text-[#121514]">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium capitalize text-[#121514]">{line.product?.name ?? '-'}</span>
                        <span className="text-xs text-[#737A76]">ID: {line.product?.id ?? '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-[#121514]">{formatPeso(line.unitPrice)}</TableCell>
                    <TableCell className="text-center font-medium text-[#121514]">{line.quantity}</TableCell>
                    <TableCell className="text-center font-medium text-[#121514]">{formatPeso(line.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter className="border-t border-[#DFE2E0] bg-white">
                <TableRow className="hover:bg-transparent">
                  <TableCell className="text-right text-sm font-semibold uppercase text-[#121514]" colSpan={4}>
                    Total
                  </TableCell>
                  <TableCell className="text-center text-base font-medium text-[#159947]">
                    {formatPeso(totalOrderAmount)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-5">
          <Button
            className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
            onClick={() => {
              setIsConfirmAddModalOpen(false)
            }}
            type="button"
            variant="outline"
          >
            Back
          </Button>
          <Button
            className="rounded-xl px-3 py-2 text-sm"
            disabled={!orderFormCanSubmit || addOrderMutation.isLoading}
            onClick={handleAddOrder}
            type="button"
          >
            Confirm order
          </Button>
        </div>
      </AppModal>
    </section>
  )
}
