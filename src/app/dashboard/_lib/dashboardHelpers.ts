import type { DateRange } from "react-day-picker"

export function getCurrentYearDateRange(referenceDate = new Date()): DateRange {
  const year = referenceDate.getFullYear()

  return {
    from: new Date(year, 0, 1),
    to: new Date(year, 11, 31),
  }
}

export function getDefaultCurrentYearDashboardRange(referenceDate = new Date()): DateRange {
  const year = referenceDate.getFullYear()
  const currentMonth = referenceDate.getMonth()
  const startMonth = Math.max(0, currentMonth - 2)

  return {
    from: new Date(year, startMonth, 1),
    to: new Date(year, currentMonth, referenceDate.getDate()),
  }
}

export function clampDateToCurrentYear(date: Date, referenceDate = new Date()) {
  const currentYearRange = getCurrentYearDateRange(referenceDate)
  const from = currentYearRange.from!
  const to = currentYearRange.to!

  if (date < from) return from
  if (date > to) return to

  return date
}

export function clampRangeToCurrentYear(range: DateRange | undefined, referenceDate = new Date()): DateRange {
  const currentYearRange = getCurrentYearDateRange(referenceDate)
  const from = range?.from ? clampDateToCurrentYear(range.from, referenceDate) : currentYearRange.from!
  const to = range?.to ? clampDateToCurrentYear(range.to, referenceDate) : currentYearRange.to!

  return {
    from,
    to: to < from ? from : to,
  }
}

export function formatDashboardDateParam(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const year = date.getFullYear()

  return `${month}-${day}-${year}`
}

// "September 2026" from the API -> "Sep" (the chart only shows the current year).
export function shortMonthLabel(month: string) {
  return month.split(" ")[0].slice(0, 3)
}

export function formatDashboardPeso(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 0,
  }).format(amount)
}
