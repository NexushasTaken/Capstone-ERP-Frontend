'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

import { Search, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import SortPopover from '@/app/components/SortPopover'
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
import { fetchSales } from '@/app/services/saleApi'
import { fetchOrderTypes } from '@/app/services/orderApi'
import { queryKeys } from '@/app/utils/query/queryKeys'
import { normalizeOrderText } from '@/app/utils/helpers/orderHelpers'
import type { SalesSortBy } from '@/app/types/sale'
import { getSaleFilter, saleSortOptions } from '@/app/utils/helpers/saleSortHelpers'
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
]

export default function SalesForm() {
  const [exportCooldown, setExportCooldown] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrderTypeFilter, setSelectedOrderTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState<SalesSortBy>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
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
    }, 400)

    return () => clearTimeout(timeout)
  }, [search])

  const salesQueryParams = {
    page: currentPage,
    pageSize,
    name: debouncedSearch || undefined,
    filter: getSaleFilter({ value: sortBy, order: sortOrder }),
    orderTypeId: selectedOrderTypeFilter ? Number(selectedOrderTypeFilter) : 0,
  }
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: queryKeys.sales.all(salesQueryParams),
    queryFn: ({ signal }) => fetchSales(salesQueryParams, signal),
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
          <SortPopover
            value={sortBy}
            order={sortOrder}
            options={saleSortOptions}
            onChange={(value, order) => {
              setSortBy(value)
              setSortOrder(order)
              setCurrentPage(1)
            }}
          />
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
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
                  <Loading />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-red-500">
                  {error instanceof Error ? error.message : 'Failed to load sales'}
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
                  No sales found.
                </td>
              </tr>
            ) : (
              sales.map((sale) => {
                const productName = getSaleProductName(sale)
                const customerName = getSaleCustomerName(sale)
                const quantity = getSaleQuantity(sale)
                const statusLabel = getSaleStatusLabel(sale)

                return (
                  <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={sale.id}>
                    <td className="rounded-l-xl px-3 py-4 font-medium whitespace-nowrap">{formatSaleId(sale.id)}</td>
                    <td className="px-3 py-4 font-medium whitespace-nowrap capitalize">{productName}</td>
                    <td className="px-3 py-4 whitespace-nowrap capitalize">{normalizeOrderText(sale.orderType)}</td>
                    <td className="px-3 py-4 font-medium whitespace-nowrap capitalize">{customerName}</td>
                    <td className="px-3 py-4 text-center">{quantity}</td>
                    <td className="px-3 py-4 font-medium whitespace-nowrap">{formatPeso(sale.total)}</td>
                    <td className="px-3 py-4 font-medium whitespace-nowrap">{formatDate(sale.created_At)}</td>
                    <td className="rounded-r-xl px-3 py-4 whitespace-nowrap capitalize">
                      <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${saleStatusDotClass(statusLabel)}`} />
                      {statusLabel}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-[#737A76]">
          Showing {sales.length} of {rows} sales
          {isFetching ? ' - Updating...' : ''}
        </span>
        <div className="flex">
          <PaginationDemo currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />
        </div>
      </div>
    </section>
  )
}
