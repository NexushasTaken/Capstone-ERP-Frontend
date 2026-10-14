"use client"

import { useState } from "react"
import ExportCsvButton from "@/components/ExportCsvButton"
import ListHeader from "@/components/ListHeader"
import OrderTypeFilterSelect from "@/components/OrderTypeFilterSelect"
import SearchInput from "@/components/SearchInput"
import SortPopover from "@/components/SortPopover"
import PageSizeSelect from "@/components/PageSizeSelect"
import { TablePagination } from "@/components/TablePagination"
import { usePageSize } from "@/hooks/usePageSize"
import { useUrlSearch } from "@/hooks/useUrlSearch"
import { exportToCSV } from "@/lib/exportToCsv"
import { formatDate, formatPeso } from "@/lib/format"
import { normalizeOrderText } from "@/lib/helpers/orderHelpers"
import {
  formatSaleId,
  getSaleCustomerName,
  getSaleProductName,
  getSaleQuantity,
  getSaleStatusLabel,
} from "@/lib/helpers/saleHelpers"
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

  const { data, isLoading, isFetching, error } = useSales({
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
        count={rows}
        actions={
          <ExportCsvButton disabled={isFetching || !!error || sales.length === 0} onExport={() => exportSales(sales)} />
        }
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

      <p className="mt-3 text-sm text-muted-foreground">
        {rows.toLocaleString("en-PH")} {rows === 1 ? "sale" : "sales"} totalling{" "}
        <span className="font-medium text-foreground">{formatPeso(totalAmount)}</span>
      </p>

      <div className="mt-5 min-h-0 flex-1 overflow-auto scrollbar-x-only">
        <SalesTable sales={sales} isLoading={isLoading} error={error} onSeeMore={setDetailsSale} />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {sales.length} of {rows} sales
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

      <SaleDetailsModal sale={detailsSale} onClose={() => setDetailsSale(null)} />
    </section>
  )
}

function exportSales(sales: Sale[]) {
  exportToCSV(
    sales,
    [
      { header: "Sale ID", value: (sale) => formatSaleId(sale.id) },
      { header: "Product", value: (sale) => getSaleProductName(sale) },
      {
        header: "Order type",
        value: (sale) => normalizeOrderText(sale.orderType),
      },
      { header: "Customer", value: (sale) => getSaleCustomerName(sale) },
      { header: "Quantity", value: (sale) => getSaleQuantity(sale) },
      { header: "Discount (%)", value: (sale) => sale.discountPercent },
      { header: "Total amount", value: (sale) => sale.total },
      { header: "Sale date", value: (sale) => formatDate(sale.created_At) },
      { header: "Status", value: (sale) => getSaleStatusLabel(sale) },
    ],
    "sales",
  )
}
