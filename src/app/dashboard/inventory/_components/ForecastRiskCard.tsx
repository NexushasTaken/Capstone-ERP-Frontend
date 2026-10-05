'use client'

import { AlertTriangle } from 'lucide-react'
import { useForecastRiskCount } from '../_hooks/useInventory'

export default function ForecastRiskCard() {
  const forecastWarningCount = useForecastRiskCount()

  return (
    <article className="flex flex-col rounded-2xl border border-[#DCE4DE] bg-white p-5 shadow-sm h-full">
      <div className="flex items-start justify-between">
        <p className="text-sm text-[#68716C]">Forecast risks</p>
        <span className="rounded-xl bg-[#FBE7E7] p-2 text-[#B42318]"><AlertTriangle className="h-5 w-5" /></span>
      </div>
      <p className="flex flex-1 mt-4 text-7xl font-semibold text-[#0c0d0d]">{forecastWarningCount}</p>
      <p className="mt-2 text-sm text-[#68716C]">products forecast to run out</p>
    </article>
  )
}
