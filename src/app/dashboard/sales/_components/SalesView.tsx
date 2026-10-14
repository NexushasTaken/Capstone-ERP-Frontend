"use client"

import { useState } from "react"
import ListHeader from "@/components/ListHeader"
import ListSummary from "@/components/ListSummary"
import OrderTypeFilterSelect from "@/components/OrderTypeFilterSelect"
import SearchInput from "@/components/SearchInput"
import SortPopover from "@/components/SortPopover"
import PageSizeSelect from "@/components/PageSizeSelect"
import { TablePagination } from "@/components/TablePagination"
import { usePageSize } from "@/hooks/usePageSize"
import { useUrlSearch } from "@/hooks/useUrlSearch"
import { formatCount, formatPeso } from "@/lib/format"
import type { Sale } from "@/types/sale"
import { useSaleFilters } from "../_hooks/useSaleFilters"
import { useSales } from "../_hooks/useSales"
import { getSaleFilter, saleSortOptions } from "../_lib/saleSort"
import SaleDateFilter from "./SaleDateFilter"
import SaleDetailsModal from "./SaleDetailsModal"
import SalesTable from "./SalesTable"

export default function SalesView() {
  const { values: filters, update } = useSaleFilters()
  const { orderType: selectedOrderTypeFilter, sortBy, sortOrder, page: currentPage } = filters
  const [search, setSearch] = useUrlSearch(filters.search, (value) => update({ search: value }))
  const [detailsSale, setDetailsSale] = useState<Sale | null>(null)
  const [pageSize, setPageSize] = usePageSize("sales")

  const { data, isLoading, isPlaceholderData, isFetching, error } = useSales({
    page: currentPage,
    pageSize,
    name: filters.search || undefined,
    orderTypeId: selectedOrderTypeFilter ? Number(selectedOrderTypeFilter) : 0,
    filter: getSaleFilter(sortBy, sortOrder),
    from: filters.from || undefined,
    to: filters.to || undefined,
  })

  const sales = data?.items ?? []
  const rows = data?.rows ?? 0
  const totalAmount = data?.totalAmount ?? 0
  const pageCount = Math.max(1, data?.pageCount ?? 1)

  function goToPage(page: number) {
    update({ page })
  }

  return (
    <section className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-background">
      <ListHeader
        title="Sales"
        search={
          <SearchInput value={search} onChange={setSearch} placeholder="Search by product, customer, type or ID" />
        }
        filters={
          <>
            <OrderTypeFilterSelect value={selectedOrderTypeFilter} onChange={(orderType) => update({ orderType })} />
            <SaleDateFilter from={filters.from} to={filters.to} onChange={(from, to) => update({ from, to })} />
            <SortPopover
              value={sortBy}
              order={sortOrder}
              options={saleSortOptions}
              onChange={(value, order) => update({ sortBy: value, sortOrder: order })}
            />
          </>
        }
      />

      <ListSummary>
        {formatCount(rows, "sale")} totalling{" "}
        <span className="font-medium text-foreground">{formatPeso(totalAmount)}</span>
      </ListSummary>

      <div className="mt-5 min-h-0 flex-1 overflow-auto scrollbar-x-only">
        <SalesTable sales={sales} isLoading={isLoading || isPlaceholderData} error={error} onSeeMore={setDetailsSale} />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {sales.length} of {rows} sales
          </span>
          <PageSizeSelect
            value={pageSize}
            onChange={(size) => {
              setPageSize(size)
              goToPage(1)
            }}
          />
          {isFetching && <span className="text-sm text-muted-foreground">Updating...</span>}
        </div>
        <div className="flex">
          <TablePagination currentPage={currentPage} totalPages={pageCount} onPageChange={goToPage} />
        </div>
      </div>

      <SaleDetailsModal sale={detailsSale} onClose={() => setDetailsSale(null)} />
    </section>
  )
}
