'use client'

import { SalesChart, type SalesChartType } from './SalesChart'
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { ArrowUpDown, MoveDownRight, MoveUpRight } from 'lucide-react'
import { Check } from 'lucide-react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/queryKeys'
import { DatePickerSimple } from '@/components/DatePicker'
import { format } from 'date-fns'
import { fetchSalesOverview } from '@/services/dashboardApi'
import {
  clampDateToCurrentYear,
  clampRangeToCurrentYear,
  formatDashboardDateParam,
  formatDashboardPeso,
  getCurrentYearDateRange,
  getDefaultCurrentYearDashboardRange,
  getDateRangeMonthLabels,
} from '@/app/dashboard/_lib/dashboardHelpers'

const salesChartOptions: { label: string; value: SalesChartType }[] = [
  { label: 'Line chart', value: 'line' },
  { label: 'Pie chart', value: 'pie' },
  { label: 'Bar chart', value: 'bar' },
]

// Sales total, growth and chart for a date range within the current year.
export default function SalesOverviewCard() {
  const [salesChartType, setSalesChartType] = useState<SalesChartType>('line')
  const [selectedSalesDateRange, setSalesDateRange] = useState<DateRange>(getDefaultCurrentYearDashboardRange())
  const currentYearRange = getCurrentYearDateRange()
  const salesDateRange = clampRangeToCurrentYear(selectedSalesDateRange)

  const salesOverviewParams = {
    from: formatDashboardDateParam(salesDateRange.from!),
    to: formatDashboardDateParam(salesDateRange.to ?? salesDateRange.from!),
  }
  const {
    data: salesOverview,
    isLoading: isSalesOverviewLoading,
    error: salesOverviewError,
  } = useQuery({
    queryKey: queryKeys.dashboard.salesOverview(salesOverviewParams),
    queryFn: ({ signal }) => fetchSalesOverview(salesOverviewParams, signal),
    placeholderData: keepPreviousData,
  })
  const salesChartValues = salesOverview?.data.map((item) => item.data) ?? []
  const salesChartLabels = getDateRangeMonthLabels(salesDateRange, salesChartValues.length)
  const totalSales = salesOverview?.totalSales ?? 0
  const growthPercentage = salesOverview?.growthPercentage ?? 0
  const growthErrorMessage = salesOverview?.growthErrorMessage?.trim()

  return (
    <div className="flex shrink-0 flex-col gap-4 rounded-lg bg-muted p-4">
      <div className="flex flex-col xl:flex-row w-full">
        <div className="flex min-h-76 w-full flex-col gap-4 p-4">
          <div className="flex w-full flex-wrap gap-4 justify-between items-center">
            <span className="text-foreground text-lg font-medium md:text-2xl">Sales Overview</span>
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <DatePickerSimple
                  label="From"
                  minDate={currentYearRange.from}
                  maxDate={currentYearRange.to}
                  value={format(salesDateRange.from!, 'yyyy-MM-dd')}
                  onChange={(value) => {
                    if (!value) return
                    const parsedDate = new Date(`${value}T00:00:00`)
                    if (Number.isNaN(parsedDate.getTime())) return
                    const from = clampDateToCurrentYear(parsedDate)
                    setSalesDateRange((range) => ({
                      from,
                      to: range.to && range.to >= from ? range.to : from,
                    }))
                  }}
                />
              </div>
              <div>
                <DatePickerSimple
                  label="To"
                  minDate={currentYearRange.from}
                  maxDate={currentYearRange.to}
                  value={format(salesDateRange.to ?? salesDateRange.from!, 'yyyy-MM-dd')}
                  onChange={(value) => {
                    if (!value) return
                    const parsedDate = new Date(`${value}T00:00:00`)
                    if (Number.isNaN(parsedDate.getTime())) return
                    const to = clampDateToCurrentYear(parsedDate)
                    setSalesDateRange((range) => ({
                      from: range.from && range.from <= to ? range.from : to,
                      to,
                    }))
                  }}
                />
              </div>
              <Popover>
                <PopoverTrigger className="bg-transparent border-2 border-border rounded-xl text-foreground font-medium p-2 cursor-pointer transition-all duration-300 hover:scale-105 group">
                  <ArrowUpDown className="transition-all group-hover:scale-105" />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-60">
                  <PopoverHeader className="border-b px-4 py-3">
                    <PopoverTitle>Chart view</PopoverTitle>
                  </PopoverHeader>

                  <div className="flex flex-col">
                    {salesChartOptions.map((option) => {
                      const selected = salesChartType === option.value

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSalesChartType(option.value)}
                          className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-accent ${
                            selected ? 'bg-muted/50 font-medium' : ''
                          }`}
                        >
                          <span>{option.label}</span>

                          {selected && <Check size={16} className="text-foreground" />}
                        </button>
                      )
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="relative w-full min-h-0 flex-1">
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-4xl font-bold text-foreground md:text-5xl">
                <span className="text-muted-foreground">&#8369;</span>
                {isSalesOverviewLoading ? '...' : formatDashboardPeso(totalSales)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md text-nowrap border border-border bg-muted/50 px-2 py-1 text-xs text-muted-foreground md:text-sm">
                {growthPercentage.toFixed(1)}%
                {!growthErrorMessage &&
                  (growthPercentage < 0 ? <MoveDownRight className="h-4 w-4" /> : <MoveUpRight className="h-4 w-4" />)}
              </span>
              {growthErrorMessage && <span className="text-xs text-destructive md:text-sm">{growthErrorMessage}</span>}
            </div>
            {salesOverviewError ? (
              <div className="flex h-full min-h-64 items-center justify-center text-sm text-destructive">
                {salesOverviewError instanceof Error ? salesOverviewError.message : 'Failed to load sales overview'}
              </div>
            ) : (
              <div className="mt-4 py-4">
                <SalesChart type={salesChartType} labels={salesChartLabels} values={salesChartValues} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
