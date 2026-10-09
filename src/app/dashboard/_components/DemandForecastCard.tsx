"use client"

import { useState } from "react"
import DataTable, { type DataTableColumn } from "@/components/DataTable"
import { TablePagination } from "@/components/TablePagination"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { DemandForecastItem } from "@/types/dashboard"
import { useDemandForecast, useForceForecast } from "../_hooks/useDemandForecast"
import { forecastMethodLabel, formatDemandRange, formatUnits } from "../_lib/forecastFormat"
import DemandChartDialog from "./DemandChartDialog"

const PAGE_SIZE = 10

const columns: DataTableColumn[] = [
  "Product",
  { label: "Forecasted demand (next 4 weeks)", className: "text-right" },
  { label: "In stock", className: "text-right" },
  "Runs out around",
  { label: "Suggested order", className: "text-right" },
  "Method",
  { label: "Chart", srOnly: true },
]

export default function DemandForecastCard() {
  const [page, setPage] = useState(1)
  const [chartProduct, setChartProduct] = useState<DemandForecastItem | null>(null)

  const forecastQuery = useDemandForecast({ page, pageSize: PAGE_SIZE })
  const forceForecast = useForceForecast(() => setPage(1))

  const data = forecastQuery.data
  const items = data?.items ?? []
  const totalPages = Math.max(1, data?.pageCount ?? 1)
  const accuracy = data?.accuracy

  return (
    <article className="w-full min-w-0 rounded-2xl border border-border bg-background shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Demand Forecast &amp; Restock Recommendations</h2>
          <p className="mt-1 text-xs text-muted-foreground lg:text-sm">
            Expected sales for the next 4 weeks, with a 95% range, and how much to order to cover a busy month.
          </p>
          {accuracy && accuracy.productsTested > 0 && (
            <p className="mt-1 text-xs text-muted-foreground lg:text-sm">
              Last 12 weeks: the AI was off by ±{Math.round(accuracy.aiErrorPercent)}%, a simple 4-week average by ±
              {Math.round(accuracy.baselineErrorPercent)}% ({accuracy.productsTested} products tested).
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {data?.generatedAt && (
            <span className="text-xs text-muted-foreground">Updated {formatDate(data.generatedAt)}</span>
          )}
          <Button disabled={forceForecast.isPending} onClick={() => forceForecast.mutate()} type="button">
            {forceForecast.isPending ? "Forecasting..." : "Force Forecast"}
          </Button>
          <span className="rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-destructive">
            {data?.needOrderCount ?? 0} need ordering
          </span>
        </div>
      </div>

      <div className="overflow-auto">
        <DataTable
          className="min-w-200"
          columns={columns}
          emptyMessage="No products to forecast."
          error={forecastQuery.error}
          errorMessage="Failed to load the demand forecast"
          isEmpty={items.length === 0}
          isLoading={forecastQuery.isLoading || forceForecast.isPending}
        >
          {items.map((item) => {
            const method = forecastMethodLabel[item.method]
            return (
              <TableRow className="cursor-pointer" key={item.productId} onClick={() => setChartProduct(item)}>
                <TableCell className="px-3 py-4 font-medium capitalize">{item.name}</TableCell>
                <TableCell className="px-3 py-4 text-right">
                  {formatDemandRange(item.expectedDemand, item.lowDemand, item.busyDemand)}
                </TableCell>
                <TableCell className="px-3 py-4 text-right">{formatUnits(item.stockOnHand)}</TableCell>
                <TableCell className="px-3 py-4 text-muted-foreground">
                  {item.runsOutAround ? formatDate(item.runsOutAround) : "Not soon"}
                </TableCell>
                <TableCell
                  className={cn(
                    "px-3 py-4 text-right font-medium",
                    item.suggestedOrder > 0 ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {item.suggestedOrder > 0 ? formatUnits(item.suggestedOrder) : "—"}
                </TableCell>
                <TableCell className="px-3 py-4 text-muted-foreground" title={method?.hint}>
                  {method?.label ?? "—"}
                </TableCell>
                <TableCell className="px-3 py-4 text-right">
                  <Button
                    onClick={(event) => {
                      event.stopPropagation()
                      setChartProduct(item)
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Chart
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </DataTable>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-border p-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-muted-foreground">
          Showing {items.length} of {data?.rows ?? 0} products, those running out first on top
        </span>
        <TablePagination currentPage={Math.min(page, totalPages)} onPageChange={setPage} totalPages={totalPages} />
      </div>

      {chartProduct && <DemandChartDialog onClose={() => setChartProduct(null)} product={chartProduct} />}
    </article>
  )
}
