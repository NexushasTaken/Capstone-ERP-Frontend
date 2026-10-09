"use client"

import { useState } from "react"
import DemandChartDialog from "@/components/DemandChartDialog"
import ExportCsvButton from "@/components/ExportCsvButton"
import ListHeader from "@/components/ListHeader"
import PageSizeSelect from "@/components/PageSizeSelect"
import SearchInput from "@/components/SearchInput"
import { TablePagination } from "@/components/TablePagination"
import { Button } from "@/components/ui/button"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useDemandForecast, useForceForecast } from "@/hooks/useDemandForecast"
import { usePageSize } from "@/hooks/usePageSize"
import { exportToCSV } from "@/lib/exportToCsv"
import { forecastMethodLabel } from "@/lib/forecastFormat"
import { formatDate } from "@/lib/format"
import type { DemandForecastItem } from "@/types/dashboard"
import ForecastTable from "./ForecastTable"
import NeedOrderFilterSelect from "./NeedOrderFilterSelect"

function exportForecast(items: DemandForecastItem[]) {
  exportToCSV(
    items,
    [
      { header: "Product", value: (item) => item.name },
      { header: "Forecasted demand (next 4 weeks)", value: (item) => Math.round(item.expectedDemand) },
      { header: "Low", value: (item) => Math.round(item.lowDemand) },
      { header: "Busy case", value: (item) => Math.round(item.busyDemand) },
      { header: "In stock", value: (item) => Math.round(item.stockOnHand) },
      {
        header: "Runs out around",
        value: (item) => (item.runsOutAround ? formatDate(item.runsOutAround) : "Not soon"),
      },
      { header: "Suggested order", value: (item) => Math.round(item.suggestedOrder) },
      { header: "Method", value: (item) => forecastMethodLabel[item.method]?.label },
    ],
    "demand-forecast",
  )
}

export default function ForecastView() {
  const [search, setSearch] = useState("")
  const [needOrderOnly, setNeedOrderOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [chartProduct, setChartProduct] = useState<DemandForecastItem | null>(null)
  const debouncedSearch = useDebouncedValue(search.trim())
  const [pageSize, setPageSize] = usePageSize("forecast")

  const { data, isLoading, isFetching, error } = useDemandForecast({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
    needOrderOnly,
  })
  const forceForecast = useForceForecast(() => setCurrentPage(1))

  const items = data?.items ?? []
  const rows = data?.rows ?? 0
  const pageCount = Math.max(1, data?.pageCount ?? 1)
  const accuracy = data?.accuracy

  return (
    <section className="flex h-dvh w-full flex-col overflow-hidden rounded-2xl bg-background p-4 lg:p-5">
      <ListHeader
        title="Demand Forecast"
        count={rows}
        actions={
          <>
            {data?.generatedAt && (
              <span className="text-xs text-muted-foreground">Updated {formatDate(data.generatedAt)}</span>
            )}
            <ExportCsvButton
              disabled={isFetching || !!error || items.length === 0}
              onExport={() => exportForecast(items)}
            />
            <Button disabled={forceForecast.isPending} onClick={() => forceForecast.mutate()} type="button">
              {forceForecast.isPending ? "Forecasting..." : "Force Forecast"}
            </Button>
          </>
        }
        search={
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            placeholder="Search by product"
          />
        }
        filters={
          <NeedOrderFilterSelect
            needOrderOnly={needOrderOnly}
            onChange={(value) => {
              setNeedOrderOnly(value)
              setCurrentPage(1)
            }}
          />
        }
      />

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground lg:text-sm">
        <span>Expected sales for the next 4 weeks, with a 95% range, and how much to order to cover a busy month.</span>
        {accuracy && accuracy.productsTested > 0 && (
          <span>
            Last 12 weeks: the AI was off by ±{Math.round(accuracy.aiErrorPercent)}%, a simple 4-week average by ±
            {Math.round(accuracy.baselineErrorPercent)}% ({accuracy.productsTested} products tested).
          </span>
        )}
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-auto scrollbar-x-only">
        <ForecastTable
          error={error}
          isLoading={isLoading || forceForecast.isPending}
          items={items}
          onOpenChart={setChartProduct}
        />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {items.length} of {rows} products, those running out first on top
            {isFetching ? " - Updating..." : ""}
          </span>
          <PageSizeSelect
            value={pageSize}
            onChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
          />
        </div>
        <div className="flex">
          <TablePagination
            currentPage={Math.min(currentPage, pageCount)}
            onPageChange={setCurrentPage}
            totalPages={pageCount}
          />
        </div>
      </div>

      {chartProduct && <DemandChartDialog onClose={() => setChartProduct(null)} product={chartProduct} />}
    </section>
  )
}
