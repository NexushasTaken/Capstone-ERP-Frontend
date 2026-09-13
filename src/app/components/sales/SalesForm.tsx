'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

import { ChevronDown, Search, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  formatPeso,
  formatSaleId,
  formatDate,
  getSaleProductName,
  getSaleCustomerName,
  getSaleQuantity,
  getSaleStatusLabel,
  saleStatusDotClass,
} from '@/app/utils/helpers/saleHelpers'
import { exportToCSV } from '@/app/utils/exportToCsv'
import { Input } from '@/components/ui/input'
import { PaginationDemo } from '@/app/components/Pagination'
import Loading from '@/app/components/loaders/Loading'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import { fetchSales } from '@/app/services/saleApi'
import { fetchOrderTypes } from '@/app/services/orderApi'
import { queryKeys } from '@/app/utils/query/queryKeys'
import { normalizeOrderText } from '@/app/utils/helpers/orderHelpers'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const tableColumns = [
  'Sale ID',
  'Product',
  'Order type',
  'Customer',
  'Quantity',
  'Total amount',
  'Sale date',
  'Status',
  'Actions',
]

export default function SalesForm() {
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null)
  const [exportCooldown, setExportCooldown] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrderTypeFilter, setSelectedOrderTypeFilter] = useState('')
  const pageSize = 10

  useEffect(() => {
    if (exportCooldown <= 0) return

    const timer = setTimeout(() => {
      setExportCooldown((previous) => previous - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [exportCooldown])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setCurrentPage(1)
      setExpandedSaleId(null)
    }, 400)

    return () => clearTimeout(timeout)
  }, [search])

  const salesQueryParams = {
    page: currentPage,
    pageSize,
    name: debouncedSearch || undefined,
    orderTypeId: selectedOrderTypeFilter ? Number(selectedOrderTypeFilter) : 0,
  }
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: queryKeys.sales.all(salesQueryParams),
    queryFn: ({ signal }) => fetchSales(salesQueryParams, signal),
    staleTime: 0,
    keepPreviousData: true,
  })
  const { data: orderTypes = [], isLoading: orderTypesLoading } = useQuery({
    queryKey: queryKeys.orders.types,
    queryFn: fetchOrderTypes,
  })
  const sales = data?.items ?? []
  const rows = data?.rows ?? 0
  const pageCount = Math.max(1, data?.pageCount ?? 1)
  const orderTypeFilterSelectItems = [
    { value: 'all', label: 'All types' },
    ...orderTypes.map((orderType) => ({
      value: String(orderType.id),
      label: normalizeOrderText(orderType.type),
    })),
  ]

  return (
    <section className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-[#121514]">Sales</h1>
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
              placeholder="Search sales"
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

          <div className="w-48">
            <Select
              disabled={orderTypesLoading}
              items={orderTypeFilterSelectItems}
              onValueChange={(value) => {
                setSelectedOrderTypeFilter(value === 'all' ? '' : String(value ?? ''))
                setCurrentPage(1)
              }}
              value={selectedOrderTypeFilter || 'all'}
            >
              <SelectTrigger className="h-10 w-full rounded-xl border-[#DFE2E0] bg-white px-3 text-sm focus-visible:border-[#121514] focus-visible:ring-[#121514]/20">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {orderTypes.map((orderType) => (
                  <SelectItem key={orderType.id} value={String(orderType.id)} className="capitalize">
                    {normalizeOrderText(orderType.type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            className={`h-auto rounded-xl border border-[#DFE2E0] px-3 py-2 text-sm whitespace-nowrap transition-colors ${exportCooldown > 0 ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'hover:bg-[#DCE4DF] cursor-pointer text-black'}`}
            disabled={exportCooldown > 0 || isFetching || !!error || sales.length === 0}
            type="button"
            onClick={() => {
              exportToCSV(
                sales,
                [
                  { header: 'Sale ID', value: (sale) => formatSaleId(sale.id) },
                  { header: 'Product', value: (sale) => getSaleProductName(sale) },
                  { header: 'Order type', value: (sale) => normalizeOrderText(sale.orderType) },
                  { header: 'Customer', value: (sale) => getSaleCustomerName(sale) },
                  { header: 'Quantity', value: (sale) => getSaleQuantity(sale) },
                  { header: 'Total amount', value: (sale) => sale.total },
                  { header: 'Sale date', value: (sale) => formatDate(sale.created_At) },
                  { header: 'Status', value: (sale) => getSaleStatusLabel(sale) },
                ],
                'sales'
              )
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
        </div>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-220 border-separate border-spacing-y-2 text-left">
          <thead className="text-sm font-normal text-[#737A76]">
            <tr>
              {tableColumns.map((column) => (
                <th className="px-3 pb-1 font-normal" key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
            {isLoading ? (
              <tbody><tr>
                <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
                  <Loading />
                </td>
              </tr></tbody>
            ) : error ? (
              <tbody><tr>
                <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-red-500">
                  {error instanceof Error ? error.message : 'Failed to load sales'}
                </td>
              </tr></tbody>
            ) : sales.length === 0 ? (
              <tbody><tr>
                <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
                  No sales found.
                </td>
              </tr></tbody>
            ) : (
              sales.map((sale) => {
                const productName = getSaleProductName(sale)
                const customerName = getSaleCustomerName(sale)
                const quantity = getSaleQuantity(sale)
                const statusLabel = getSaleStatusLabel(sale)
                const isExpanded = expandedSaleId === sale.id

                return (
                  <Collapsible
                    key={sale.id}
                    render={<tbody />}
                    open={isExpanded}
                    onOpenChange={(open) => setExpandedSaleId(open ? sale.id : null)}
                  >
                    <tr className="bg-[#FAFBFA] text-sm text-[#121514]">
                      <td className="rounded-l-xl px-3 py-4 font-medium whitespace-nowrap">{formatSaleId(sale.id)}</td>
                      <td className="px-3 py-4 font-medium whitespace-nowrap capitalize">{productName}</td>
                      <td className="px-3 py-4 whitespace-nowrap capitalize">{normalizeOrderText(sale.orderType)}</td>
                      <td className="px-3 py-4 font-medium whitespace-nowrap capitalize">{customerName}</td>
                      <td className="px-3 py-4 text-center">{quantity}</td>
                      <td className="px-3 py-4 font-medium whitespace-nowrap">{formatPeso(sale.total)}</td>
                      <td className="px-3 py-4 font-medium whitespace-nowrap">{formatDate(sale.created_At)}</td>
                      <td className="px-3 py-4 whitespace-nowrap capitalize">
                        <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${saleStatusDotClass(statusLabel)}`} />
                        {statusLabel}
                      </td>
                      <td className="rounded-r-xl px-3 py-4 whitespace-nowrap">
                        <CollapsibleTrigger
                          type="button"
                          className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#DFE2E0] bg-white px-3 py-1.5 text-sm whitespace-nowrap transition-all hover:bg-[#DCE4DF]"
                          aria-label={'View ' + formatSaleId(sale.id) + ' details'}
                        >
                          View
                          <ChevronDown className={'h-4 w-4 transition-transform ' + (isExpanded ? 'rotate-180' : '')} />
                        </CollapsibleTrigger>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr>
                        <td colSpan={tableColumns.length} className="p-0">
                          <div className="border-t border-[#E2E2E2] bg-white p-4">
                            <dl className="grid grid-cols-4 gap-4 text-sm">
                              {[
                                ['Customer', getSaleCustomerName(sale)],
                                ['Order type', normalizeOrderText(sale.orderType)],
                                ['Status', getSaleStatusLabel(sale)],
                                ['Driver', sale.driverName || 'Unassigned'],
                                ['Pickup address', sale.pickUpAddress || '-'],
                                ['Delivery address', sale.deliveryAddress || '-'],
                                ['Sale date', formatDate(sale.created_At)],
                                ['Quantity', getSaleQuantity(sale)],
                                ['Total amount', formatPeso(sale.total)],
                              ].map(([label, value]) => (
                                <div key={label}>
                                  <dt className="text-xs text-[#737A76]">{label}</dt>
                                  <dd className="break-words font-medium text-[#121514] capitalize">{value}</dd>
                                </div>
                              ))}
                            </dl>
                            <div className="mt-5 max-h-80 overflow-auto rounded-lg border border-[#E2E2E2] scrollbar-none">
                              <table className="w-full text-left text-sm">
                                <caption className="sr-only">Sale products</caption>
                                <thead className="sticky top-0 bg-[#F0F1F1] text-xs text-[#737A76]">
                                  <tr>
                                    {['Product', 'Quantity', 'Unit price', 'Amount'].map((column) => (
                                      <th key={column} scope="col" className="px-3 py-2 font-normal">{column}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {sale.orders.map((item, index) => (
                                    <tr key={`${sale.id}-${index}`} className="border-t border-[#E2E2E2]">
                                      <td className="px-3 py-3 capitalize">{item.productName}</td>
                                      <td className="px-3 py-3">{item.quantity}</td>
                                      <td className="whitespace-nowrap px-3 py-3">{formatPeso(item.price)}</td>
                                      <td className="whitespace-nowrap px-3 py-3 font-medium">{formatPeso(item.totalAmount)}</td>
                                    </tr>
                                  ))}
                                  {sale.orders.length === 0 && (
                                    <tr><td colSpan={4} className="px-3 py-3 text-[#737A76]">No products recorded.</td></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Collapsible>
                )
              })
            )}
        </table>
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-[#737A76]">
          Showing {sales.length} of {rows} sales
          {isFetching ? ' - Updating...' : ''}
        </span>
        <div className="flex">
          <PaginationDemo currentPage={currentPage} totalPages={pageCount} onPageChange={(page) => {
              setCurrentPage(page)
              setExpandedSaleId(null)
            }} />
        </div>
      </div>
    </section>
  )
}
