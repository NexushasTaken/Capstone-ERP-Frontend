import { ForecastMethod } from "@/types/dashboard"

export const forecastMethodLabel: Record<ForecastMethod, { label: string; hint: string }> = {
  [ForecastMethod.YearlySsa]: {
    label: "AI (yearly pattern)",
    hint: "SSA learned this product's trend and yearly season from 2+ years of sales.",
  },
  [ForecastMethod.Average]: {
    label: "Average",
    hint: "Less than about 2 years of sales, so this is the average of the last 4 weeks.",
  },
  [ForecastMethod.AverageFallback]: {
    label: "Average (fallback)",
    hint: "The AI couldn't find a pattern in this product's sales, so this is the average of the last 4 weeks.",
  },
}

export function formatUnits(value: number) {
  return Math.round(value).toLocaleString("en-PH")
}

/** "480 (400–560)", or just "480" when there is no range (the average has none). */
export function formatDemandRange(expected: number, low: number, busy: number) {
  const main = formatUnits(expected)
  return Math.round(low) === Math.round(busy) ? main : `${main} (${formatUnits(low)}–${formatUnits(busy)})`
}
