import { ForecastMethod } from "@/types/dashboard"

export const forecastMethodLabel: Record<ForecastMethod, { label: string; hint: string }> = {
  [ForecastMethod.YearlySsa]: {
    label: "SSA (yearly pattern)",
    hint: "SSA found this product's trend and yearly season in 2+ years of sales.",
  },
  [ForecastMethod.ShortSsa]: {
    label: "SSA (short pattern)",
    hint: "SSA found this product's recent trend in its shorter sales history.",
  },
  [ForecastMethod.Average]: {
    label: "Average",
    hint: "Not enough sales history for SSA yet, so this is the average of the last 4 weeks.",
  },
  [ForecastMethod.AverageFallback]: {
    label: "Average (fallback)",
    hint: "SSA couldn't give a reliable forecast for this product, so this is the average of the last 4 weeks.",
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
