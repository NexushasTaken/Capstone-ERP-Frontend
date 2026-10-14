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

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/** "Oct W1": the month a week's Monday falls in, and which week of that month it is (W1 to W5). */
export function weekOfMonthLabel(monday: Date) {
  return `${monday.toLocaleDateString("en-PH", { month: "short" })} W${Math.ceil(monday.getDate() / 7)}`
}

/** "Oct 5 – Oct 11": a week from its Monday to its Sunday, or `weeks` weeks from that Monday. */
export function weekRangeLabel(monday: Date, weeks = 1) {
  const short = (date: Date) => date.toLocaleDateString("en-PH", { month: "short", day: "numeric" })
  return `${short(monday)} – ${short(addDays(monday, 7 * weeks - 1))}`
}

/** "Jul 13, 2026 – Feb 1, 2027 · 17 weeks": what a weekly chart covers, Monday of the first week to Sunday of the last. */
export function chartRangeLabel(firstMonday: Date, weeks: number) {
  const long = (date: Date) => date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
  return `${long(firstMonday)} – ${long(addDays(firstMonday, 7 * weeks - 1))} · ${weeks} weeks`
}
