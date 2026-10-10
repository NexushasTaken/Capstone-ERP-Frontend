"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useState } from "react"
import DemandChartDialog from "@/components/DemandChartDialog"
import Loading from "@/components/Loading"
import { useDemandForecast } from "@/hooks/useDemandForecast"
import { formatUnits } from "@/lib/forecastFormat"
import { formatDate } from "@/lib/format"
import type { DemandForecastItem } from "@/types/dashboard"

const SUMMARY_ROWS = 5

// Dashboard summary of the demand forecast: how many products need ordering and the ones running out first.
// The full list is on the Demand Forecast page.
export default function RestockSummaryCard() {
  const [chartProduct, setChartProduct] = useState<DemandForecastItem | null>(null)
  const { data, isLoading, error } = useDemandForecast({ page: 1, pageSize: SUMMARY_ROWS, needOrderOnly: true })

  const items = data?.items ?? []
  const accuracy = data?.accuracy

  return (
    <div className="flex h-full w-full flex-col rounded-lg bg-muted p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Restock Summary</h2>
          <p className="mt-1 text-sm text-muted-foreground">From the demand forecast for the next 4 weeks</p>
        </div>
        <Link
          href="/dashboard/forecast"
          className="text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
        >
          View all
        </Link>
      </div>

      <div className="mt-4 rounded-xl bg-background p-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="text-muted-foreground" size={18} />
          <span className="text-sm text-muted-foreground">Need ordering</span>
        </div>
        <p className="mt-3 text-4xl font-semibold text-foreground">
          {isLoading || error ? "-" : `${data?.needOrderCount ?? 0} products`}
        </p>
        {accuracy && accuracy.productsTested > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Forecast accuracy, last 12 weeks: SSA ±{Math.round(accuracy.ssaErrorPercent)}%, simple average ±
            {Math.round(accuracy.baselineErrorPercent)}%
          </p>
        )}
      </div>

      <div className="mt-5 flex-1 rounded-xl bg-background p-4">
        <h3 className="text-sm font-medium text-foreground">Running out first</h3>

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <Loading />
          ) : error ? (
            <p className="text-sm text-destructive" role="alert">
              Unable to load the demand forecast.
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing needs ordering right now.</p>
          ) : (
            items.map((item) => (
              <button
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
                key={item.productId}
                onClick={() => setChartProduct(item)}
                type="button"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground capitalize">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Runs out {item.runsOutAround ? `around ${formatDate(item.runsOutAround)}` : "not soon"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-medium text-destructive">{formatUnits(item.suggestedOrder)}</p>
                  <p className="text-xs text-muted-foreground">to order</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {chartProduct && <DemandChartDialog onClose={() => setChartProduct(null)} product={chartProduct} />}
    </div>
  )
}
