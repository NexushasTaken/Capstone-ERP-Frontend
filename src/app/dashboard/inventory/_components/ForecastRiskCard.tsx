'use client'

import { AlertTriangle } from 'lucide-react'
import { useForecastRiskCount } from '../_hooks/useInventory'

export default function ForecastRiskCard() {
  const forecastWarningCount = useForecastRiskCount()

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-background p-5 shadow-sm h-full">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">Forecast risks</p>
        <span className="rounded-xl bg-destructive/10 p-2 text-destructive"><AlertTriangle className="h-5 w-5" /></span>
      </div>
      <p className="flex flex-1 mt-4 text-7xl font-semibold text-foreground">{forecastWarningCount}</p>
      <p className="mt-2 text-sm text-muted-foreground">products forecast to run out</p>
    </article>
  )
}
