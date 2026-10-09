"use client"

import DataTable, { type DataTableColumn } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { forecastMethodLabel, formatDemandRange, formatUnits } from "@/lib/forecastFormat"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { DemandForecastItem } from "@/types/dashboard"

interface ForecastTableProps {
  items: DemandForecastItem[]
  isLoading: boolean
  error: unknown
  onOpenChart: (item: DemandForecastItem) => void
}

const columns: DataTableColumn[] = [
  "Product",
  { label: "Forecasted demand (next 4 weeks)", className: "text-right" },
  { label: "In stock", className: "text-right" },
  "Runs out around",
  { label: "Suggested order", className: "text-right" },
  "Method",
  { label: "Chart", srOnly: true },
]

export default function ForecastTable({ items, isLoading, error, onOpenChart }: ForecastTableProps) {
  return (
    <DataTable
      className="min-w-200"
      columns={columns}
      emptyMessage="No products match."
      error={error}
      errorMessage="Failed to load the demand forecast"
      isEmpty={items.length === 0}
      isLoading={isLoading}
    >
      {items.map((item) => {
        const method = forecastMethodLabel[item.method]
        return (
          <TableRow className="cursor-pointer" key={item.productId} onClick={() => onOpenChart(item)}>
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
                  onOpenChart(item)
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
  )
}
