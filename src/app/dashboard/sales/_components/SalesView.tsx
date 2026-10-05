"use client"

import { useState } from "react"
import ExportCsvButton from "@/components/ExportCsvButton"
import ListHeader from "@/components/ListHeader"
import OrderTypeFilterSelect from "@/components/OrderTypeFilterSelect"
import SearchInput from "@/components/SearchInput"
import { TablePagination } from "@/components/TablePagination"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { exportToCSV } from "@/lib/exportToCsv"
import { formatDate } from "@/lib/format"
import { normalizeOrderText } from "@/lib/helpers/orderHelpers"
import {
  formatSaleId,
  getSaleCustomerName,
  getSaleProductName,
  getSaleQuantity,
  getSaleStatusLabel,
} from "@/lib/helpers/saleHelpers"
import type { Sale } from "@/types/sale"
import { useSales } from "../_hooks/useSales"
import SalesTable from "./SalesTable"

const PAGE_SIZE = 10

export default function SalesView() {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrderTypeFilter, setSelectedOrderTypeFilter] = useState("")
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null)
  const debouncedSearch = useDebouncedValue(search.trim())

  const { data, isLoading, isFetching, error } = useSales({
    page: currentPage,
    pageSize: PAGE_SIZE,
    name: debouncedSearch || undefined,
    orderTypeId: selectedOrderTypeFilter ? Number(selectedOrderTypeFilter) : 0,
  })

  const sales = data?.items ?? []
  const rows = data?.rows ?? 0
  const pageCount = Math.max(1, data?.pageCount ?? 1)

  function goToPage(page: number) {
    setCurrentPage(page)
    setExpandedSaleId(null)
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
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              goToPage(1)
            }}
            placeholder="Search by product, customer, type or ID"
          />
        }
        filters={
          <OrderTypeFilterSelect
            value={selectedOrderTypeFilter}
            onChange={(orderTypeId) => {
              setSelectedOrderTypeFilter(orderTypeId)
              setCurrentPage(1)
            }}
          />
        }
      />

      <div className="mt-5 min-h-0 flex-1 overflow-auto">
        <SalesTable
          sales={sales}
          isLoading={isLoading}
          error={error}
          expandedSaleId={expandedSaleId}
          onExpandedSaleChange={setExpandedSaleId}
        />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-muted-foreground">
          Showing {sales.length} of {rows} sales
          {isFetching ? " - Updating..." : ""}
        </span>
        <div className="flex">
          <TablePagination currentPage={currentPage} totalPages={pageCount} onPageChange={goToPage} />
        </div>
      </div>
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
      { header: "Total amount", value: (sale) => sale.total },
      { header: "Sale date", value: (sale) => formatDate(sale.created_At) },
      { header: "Status", value: (sale) => getSaleStatusLabel(sale) },
    ],
    "sales",
  )
}
