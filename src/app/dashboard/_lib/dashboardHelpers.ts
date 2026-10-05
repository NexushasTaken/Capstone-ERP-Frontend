import type { DateRange } from 'react-day-picker'

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
    to: new Date(year, currentMonth, 1),
  }
}

export function isDateInCurrentYear(date: Date, referenceDate = new Date()) {
  return date.getFullYear() === referenceDate.getFullYear()
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
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()

  return `${month}-${day}-${year}`
}

export function getDateRangeMonthLabels(range: DateRange | undefined, itemCount: number) {
  const currentYear = new Date().getFullYear()
  const startMonth = range?.from?.getMonth() ?? 0

  return Array.from({ length: itemCount }, (_, index) => {
    const month = (startMonth + index) % 12
    return new Date(currentYear, month, 1).toLocaleString('en-US', { month: 'short' })
  })
}

export function formatDashboardPeso(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    maximumFractionDigits: 0,
  }).format(amount)
}
