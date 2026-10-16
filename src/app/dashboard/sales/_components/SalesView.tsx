"use client"

import { useState } from "react"
import { FileDown } from "lucide-react"
import ListHeader from "@/components/ListHeader"
import ListSummary from "@/components/ListSummary"
import OrderTypeFilterSelect from "@/components/OrderTypeFilterSelect"
import SearchInput from "@/components/SearchInput"
import SortPopover from "@/components/SortPopover"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PageSizeSelect from "@/components/PageSizeSelect"
import { TablePagination } from "@/components/TablePagination"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { usePageSize } from "@/hooks/usePageSize"
import { useUrlSearch } from "@/hooks/useUrlSearch"
import { formatCount, formatPeso } from "@/lib/format"
import { can } from "@/lib/permissions"
import type { Sale } from "@/types/sale"
import { useSaleFilters } from "../_hooks/useSaleFilters"
import { useSaleReturnMutations } from "../_hooks/useSaleReturns"
import { useSales } from "../_hooks/useSales"
import { getSaleFilter, saleSortOptions } from "../_lib/saleSort"
import ReturnItemsModal from "./ReturnItemsModal"
import ReturnsSection from "./ReturnsSection"
import SaleDateFilter from "./SaleDateFilter"
import SaleDetailsModal from "./SaleDetailsModal"
import SalesReportModal from "./SalesReportModal"
import SalesTable from "./SalesTable"

type ModalState = { type: "details"; sale: Sale } | { type: "return"; sale: Sale } | { type: "report" } | null

export default function SalesView() {
  const { values: filters, update } = useSaleFilters()
  const { tab, orderType: selectedOrderTypeFilter, sortBy, sortOrder, page: currentPage } = filters
  const [search, setSearch] = useUrlSearch(filters.search, (value) => update({ search: value }))
  const [modal, setModal] = useState<ModalState>(null)
  const [pageSize, setPageSize] = usePageSize("sales")
  const role = useCurrentUser().data?.role
  const { returnItems } = useSaleReturnMutations()
  const isSalesTab = tab === "sales"

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
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={
              isSalesTab ? "Search by product, customer, type or ID" : "Search by product, customer or sale ID"
            }
          />
        }
        filters={
          <>
            {isSalesTab && (
              <OrderTypeFilterSelect value={selectedOrderTypeFilter} onChange={(orderType) => update({ orderType })} />
            )}
            <SaleDateFilter
              from={filters.from}
              to={filters.to}
              untilToday={!isSalesTab}
              onChange={(from, to) => update({ from, to })}
            />
            {isSalesTab && (
              <SortPopover
                value={sortBy}
                order={sortOrder}
                options={saleSortOptions}
                onChange={(value, order) => update({ sortBy: value, sortOrder: order })}
              />
            )}
            {isSalesTab && can(role, "sales:report") && (
              <Button type="button" variant="outline" className="h-10" onClick={() => setModal({ type: "report" })}>
                <FileDown />
                Export PDF
              </Button>
            )}
          </>
        }
      />

      <Tabs
        className="mt-4"
        value={tab}
        onValueChange={(value) => {
          if (value === "sales" || value === "returns") update({ tab: value, page: 1 })
        }}
      >
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
        </TabsList>
      </Tabs>

      {isSalesTab ? (
        <>
          <ListSummary>
            {formatCount(rows, "sale")} totalling{" "}
            <span className="font-medium text-foreground">{formatPeso(totalAmount)}</span> after refunds
          </ListSummary>

          <div className="mt-5 min-h-0 flex-1 overflow-auto scrollbar-x-only">
            <SalesTable
              sales={sales}
              isLoading={isLoading || isPlaceholderData}
              error={error}
              onSeeMore={(sale) => setModal({ type: "details", sale })}
            />
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
        </>
      ) : (
        <ReturnsSection
          search={filters.search}
          from={filters.from}
          to={filters.to}
          page={currentPage}
          onPageChange={goToPage}
        />
      )}

      <SaleDetailsModal
        sale={modal?.type === "details" ? modal.sale : null}
        onClose={() => setModal(null)}
        onReturn={can(role, "sales:return") ? (sale) => setModal({ type: "return", sale }) : undefined}
      />
      {modal?.type === "return" && (
        <ReturnItemsModal
          sale={modal.sale}
          isPending={returnItems.isPending}
          onClose={() => setModal(null)}
          onSubmit={(payload) => returnItems.mutate(payload, { onSuccess: () => setModal(null) })}
        />
      )}
      {modal?.type === "report" && <SalesReportModal open onClose={() => setModal(null)} />}
    </section>
  )
}
