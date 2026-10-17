"use client"

import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartConfiguration,
  type Plugin,
} from "chart.js"
import { useEffect, useMemo, useRef, useState } from "react"
import AppModal, { ModalBody, ModalHeader } from "@/components/AppModal"
import DemandBacktestSection from "@/components/DemandBacktestSection"
import Loading from "@/components/Loading"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/format"
import { themeColor } from "@/lib/cssColor"
import type { DemandChart, DemandForecastItem, DemandPastYear } from "@/types/dashboard"
import { useDemandChart } from "@/hooks/useDemandForecast"
import { drawMarker, yearStartIndex } from "@/lib/chartMarker"
import {
  chartRangeLabel,
  forecastMethodLabel,
  formatUnits,
  weekOfMonthLabel,
  weekRangeLabel,
} from "@/lib/forecastFormat"

Chart.register(CategoryScale, Filler, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip)

interface DemandChartDialogProps {
  product: DemandForecastItem
  onClose: () => void
}

// The chart shows 13 weeks (3 months), or a full year of 52, before the forecast start, then the forecast weeks;
// comparing with earlier years widens it to 13 weeks after the start, since those years have sales there
const SEASON_WEEKS = 13
// The backend sends up to a year of history, and each earlier year as 52 weeks before the start and 13 after
const FULL_YEAR_WEEKS = 52

// How many earlier years to lay over this year; 0 is all of them (null, "None", is offered before these)
const YEAR_CHOICES = [1, 2, 3, 0]

function weekStartDate(weekStart: string) {
  return new Date(`${weekStart}T00:00:00`)
}

function addWeeks(date: Date, weeks: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + 7 * weeks)
  return next
}

// Older years fade: the latest earlier year is the darkest
function pastYearAlpha(index: number, count: number) {
  return count === 1 ? 0.8 : 0.8 - (index * 0.5) / (count - 1)
}

// "2025", "2025 + 2024", "2025–2023", "All (2025–2021)": the years a choice lays over this year (newest first)
function compareLabel(count: number | null, allPastYears: DemandPastYear[]) {
  if (count === null) return "None"
  const years = count === 0 ? allPastYears : allPastYears.slice(0, count)
  const newest = years[0].year
  const oldest = years[years.length - 1].year
  if (count === 0) return `All (${newest}–${oldest})`
  if (years.length === 1) return String(newest)
  return years.length === 2 ? `${newest} + ${oldest}` : `${newest}–${oldest}`
}

// "Forecast is 12% higher" / "8% lower" / "about the same": the forecast against what sold in those weeks that year
function versusForecast(expected: number, sold: number | null) {
  if (sold === null || sold <= 0) return "—"
  const percent = Math.round(((expected - sold) / sold) * 100)
  if (percent === 0) return "Forecast is about the same"
  return `Forecast is ${Math.abs(percent)}% ${percent > 0 ? "higher" : "lower"}`
}

export default function DemandChartDialog({ product, onClose }: DemandChartDialogProps) {
  // None (null) every time the dialog opens
  const [yearsChoice, setYearsChoice] = useState<number | null>(null)
  // Off every time the dialog opens: the dialog unmounts when it closes
  const [showTest, setShowTest] = useState(false)
  // 3 months every time the dialog opens
  const [fullYear, setFullYear] = useState(false)
  const chartQuery = useDemandChart(product.productId)
  const method = forecastMethodLabel[product.method]
  const allPastYears = useMemo(() => chartQuery.data?.pastYears ?? [], [chartQuery.data])
  const pastYears = useMemo(
    () => (yearsChoice === null ? [] : yearsChoice === 0 ? allPastYears : allPastYears.slice(0, yearsChoice)),
    [allPastYears, yearsChoice],
  )
  // "None" first, then only counts the product has; "All" only when it adds more than 3
  const choices: (number | null)[] = [
    null,
    ...YEAR_CHOICES.filter((count) => (count === 0 ? allPastYears.length > 3 : count <= allPastYears.length)),
  ]
  const forecast = chartQuery.data?.forecast ?? []
  const beforeWeeks = fullYear ? FULL_YEAR_WEEKS : SEASON_WEEKS
  const totalWeeks = pastYears.length > 0 ? beforeWeeks + SEASON_WEEKS : beforeWeeks + forecast.length
  const hasRange = Math.round(product.lowDemand) !== Math.round(product.busyDemand)

  return (
    <AppModal className="overflow-y-auto xl:max-h-[90vh] xl:max-w-4xl" onClose={onClose} open>
      <ModalHeader
        onClose={onClose}
        title="Sales forecast"
        detail={<span className="capitalize">{product.name}</span>}
      />
      <ModalBody>
        <dl className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Expected to sell (next 4 weeks)</dt>
            <dd className="font-medium">{formatUnits(product.expectedDemand)}</dd>
            {hasRange && (
              <dd className="text-xs text-muted-foreground">
                likely {formatUnits(product.lowDemand)}–{formatUnits(product.busyDemand)}
              </dd>
            )}
          </div>
          <div>
            <dt className="text-muted-foreground">In stock</dt>
            <dd className="font-medium">{formatUnits(product.stockOnHand)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Runs out around</dt>
            <dd className="font-medium">{product.runsOutAround ? formatDate(product.runsOutAround) : "Not soon"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Suggested order</dt>
            <dd className="font-medium">{product.suggestedOrder > 0 ? formatUnits(product.suggestedOrder) : "—"}</dd>
          </div>
        </dl>

        <div>
          <h3 className="text-base font-medium">Weekly sales and forecast</h3>
          {forecast.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {chartRangeLabel(addWeeks(weekStartDate(forecast[0].weekStart), -beforeWeeks), totalWeeks)}
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            Each point is one week&apos;s sales, Monday to Sunday. Solid line: what sold. Dashed line: the forecast for
            the next 4 weeks, starting this week.{hasRange && " Shaded band: the likely range."}
          </p>
        </div>

        <div aria-label="Weeks to show" className="flex flex-wrap items-center gap-2" role="group">
          <span className="text-sm text-muted-foreground">Show:</span>
          {[false, true].map((choice) => (
            <Button
              aria-pressed={fullYear === choice}
              key={String(choice)}
              onClick={() => setFullYear(choice)}
              size="sm"
              type="button"
              variant={fullYear === choice ? "default" : "outline"}
            >
              {choice ? "Full year" : "3 months"}
            </Button>
          ))}
        </div>

        {choices.length > 1 && (
          <div aria-label="Earlier years to compare" className="flex flex-wrap items-center gap-2" role="group">
            <span className="text-sm text-muted-foreground">Compare with earlier years:</span>
            {choices.map((count) => (
              <Button
                aria-pressed={yearsChoice === count}
                key={count ?? "none"}
                onClick={() => setYearsChoice(count)}
                size="sm"
                type="button"
                variant={yearsChoice === count ? "default" : "outline"}
              >
                {compareLabel(count, allPastYears)}
              </Button>
            ))}
          </div>
        )}

        <div className="h-80 w-full">
          {chartQuery.isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loading />
            </div>
          ) : chartQuery.error ? (
            <p className="text-center text-sm text-destructive">
              {chartQuery.error instanceof Error ? chartQuery.error.message : "Failed to load the chart"}
            </p>
          ) : chartQuery.data ? (
            <DemandLineChart
              beforeWeeks={beforeWeeks}
              chart={chartQuery.data}
              pastYears={pastYears}
              totalWeeks={totalWeeks}
            />
          ) : null}
        </div>

        {forecast.length > 0 && (
          <SameWeeksTable
            forecastStart={weekStartDate(forecast[0].weekStart)}
            hasRange={hasRange}
            pastYears={pastYears}
            product={product}
            weeks={forecast.length}
          />
        )}

        <p className="text-xs text-muted-foreground">
          {method?.hint}
          {hasRange && " The likely range is a 95% range: most weeks land inside it."}
          {pastYears.length > 0 && " The grey lines are the same weeks in earlier years, lighter the older the year."}
          {product.ssaErrorPercent != null &&
            product.baselineErrorPercent != null &&
            ` Over the last 12 weeks the SSA forecast was off by ±${Math.round(product.ssaErrorPercent)}% for this product, a simple 4-week average by ±${Math.round(product.baselineErrorPercent)}%.`}
        </p>

        <div>
          <Toggle onPressedChange={setShowTest} pressed={showTest} size="sm" variant="outline">
            {showTest ? "Hide test" : "Show test"}
          </Toggle>
        </div>

        {showTest && <DemandBacktestSection product={product} />}
      </ModalBody>
    </AppModal>
  )
}

// The forecast weeks next to what sold in the same weeks of each earlier year (the backend steps back 52 weeks a year)
function SameWeeksTable({
  product,
  pastYears,
  forecastStart,
  weeks,
  hasRange,
}: {
  product: DemandForecastItem
  pastYears: DemandPastYear[]
  forecastStart: Date
  weeks: number
  hasRange: boolean
}) {
  return (
    <div>
      <h3 className="text-base font-medium">Next {weeks} weeks vs the same weeks in earlier years</h3>
      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Weeks</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Difference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">This year · {weekRangeLabel(forecastStart, weeks)}</TableCell>
            <TableCell className="text-right">
              <div className="font-medium">{formatUnits(product.expectedDemand)} expected</div>
              {hasRange && (
                <div className="text-xs text-muted-foreground">
                  likely {formatUnits(product.lowDemand)}–{formatUnits(product.busyDemand)}
                </div>
              )}
            </TableCell>
            <TableCell />
          </TableRow>
          {/* pastYears is the newest first, so row i is i + 1 years back */}
          {pastYears.map((pastYear, i) => (
            <TableRow key={pastYear.year}>
              <TableCell>
                {pastYear.year} · {weekRangeLabel(addWeeks(forecastStart, -52 * (i + 1)), weeks)}
              </TableCell>
              <TableCell className="text-right">
                {pastYear.sameWeeksTotal === null ? "—" : `${formatUnits(pastYear.sameWeeksTotal)} sold`}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {versusForecast(product.expectedDemand, pastYear.sameWeeksTotal)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function DemandLineChart({
  beforeWeeks,
  chart,
  pastYears,
  totalWeeks,
}: {
  beforeWeeks: number
  chart: DemandChart
  pastYears: DemandPastYear[]
  totalWeeks: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // The backend sends up to a year; 3 months shows only the last 13 weeks
    const history = chart.history.slice(-beforeWeeks)
    const forecast = chart.forecast
    if (forecast.length === 0) return

    // beforeWeeks weeks before the forecast start (index beforeWeeks), then totalWeeks - beforeWeeks from it
    const forecastStart = weekStartDate(forecast[0].weekStart)
    const mondays = Array.from({ length: totalWeeks }, (_, i) => addWeeks(forecastStart, i - beforeWeeks))
    const labels = mondays.map(weekOfMonthLabel)
    const newYear = yearStartIndex(mondays)
    const gap = (count: number) => Array<number | null>(count).fill(null)
    const afterForecast = gap(totalWeeks - beforeWeeks - forecast.length)

    // A newer product has fewer than beforeWeeks weeks before the forecast
    const actual = [...gap(beforeWeeks - history.length), ...history.map((point) => point.demand)]

    // The forecast lines start at the last actual week so they join the actual line
    const lastActual = history.at(-1)?.demand ?? null
    const joined = (values: number[]) => [...gap(beforeWeeks - 1), lastActual, ...values, ...afterForecast]

    const actualColor = themeColor("--chart-5")
    const forecastColor = themeColor("--chart-3")
    const labelColor = themeColor("--muted-foreground")
    const forecastWeeksColor = themeColor("--chart-3", 0.08)

    // Highlights the forecast weeks behind every line, marks where they start and where a new year starts
    const forecastWeeks: Plugin<"line"> = {
      id: "forecastWeeks",
      beforeDatasetsDraw: (instance) => {
        const { ctx, chartArea, scales } = instance
        const left = scales.x.getPixelForValue(beforeWeeks - 0.5)
        const right = scales.x.getPixelForValue(beforeWeeks + forecast.length - 0.5)
        ctx.save()
        ctx.fillStyle = forecastWeeksColor
        ctx.fillRect(left, chartArea.top, right - left, chartArea.bottom - chartArea.top)
        ctx.restore()
        drawMarker(instance, beforeWeeks, "This week", labelColor)
        if (newYear > 0) {
          drawMarker(
            instance,
            newYear,
            String(mondays[newYear].getFullYear()),
            labelColor,
            newYear === beforeWeeks ? 1 : 0,
          )
        }
      },
    }

    const config: ChartConfiguration<"line", (number | null)[], string> = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Sold",
            data: [...actual, ...gap(totalWeeks - beforeWeeks)],
            borderColor: actualColor,
            backgroundColor: actualColor,
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.3,
          },
          {
            label: "Low",
            data: joined(forecast.map((point) => point.low)),
            borderWidth: 0,
            pointRadius: 0,
            tension: 0.3,
          },
          {
            label: "Likely range (95%)",
            data: joined(forecast.map((point) => point.busyCase)),
            borderWidth: 0,
            pointRadius: 0,
            backgroundColor: themeColor("--chart-3", 0.2),
            fill: "-1",
            tension: 0.3,
          },
          {
            label: "Forecast",
            data: joined(forecast.map((point) => point.expected)),
            borderColor: forecastColor,
            backgroundColor: forecastColor,
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.3,
          },
          // Drawn behind this year's lines (higher order is drawn first)
          ...pastYears.map((pastYear, i) => {
            const color = themeColor("--muted-foreground", pastYearAlpha(i, pastYears.length))
            // Each earlier year starts 52 weeks before the forecast start; skip what this view doesn't show
            const first = FULL_YEAR_WEEKS - beforeWeeks
            return {
              label: String(pastYear.year),
              data: pastYear.weeks.slice(first, first + totalWeeks),
              borderColor: color,
              backgroundColor: color,
              borderWidth: 1.5,
              order: 1,
              pointRadius: 0,
              tension: 0.3,
            }
          }),
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: labelColor,
              boxHeight: 10,
              boxWidth: 10,
              usePointStyle: true,
              filter: (item) => item.text !== "Low",
            },
          },
          tooltip: {
            // Skip the "Low" helper line and the forecast lines' joining point (that week is actual)
            filter: (item) =>
              item.dataset.label !== "Low" &&
              item.raw !== null &&
              !(item.datasetIndex >= 1 && item.datasetIndex <= 3 && item.dataIndex === beforeWeeks - 1),
            callbacks: {
              title: (items) => (items.length > 0 ? `Week of ${weekRangeLabel(mondays[items[0].dataIndex])}` : ""),
              label: (context) => {
                if (context.dataset.label === "Likely range (95%)") {
                  const low = context.chart.data.datasets[1].data[context.dataIndex] as number
                  return `Likely range: ${formatUnits(low)}–${formatUnits(context.parsed.y ?? 0)}`
                }
                return `${context.dataset.label}: ${formatUnits(context.parsed.y ?? 0)}`
              },
            },
          },
        },
        scales: {
          x: {
            border: { display: false },
            grid: { display: false },
            offset: true,
            ticks: {
              color: labelColor,
              // Every week gets a label; on narrow screens they turn sideways instead of being skipped
              autoSkip: false,
              maxRotation: 90,
              font: { size: 11 },
              // "W2" under every week, with the month under the first week shown of each month
              // (and the year on the first week and in January); a full year is too crowded for "W2", so only months
              callback: (_value, index) => {
                const monday = mondays[index]
                const week = beforeWeeks > SEASON_WEEKS ? "" : `W${Math.ceil(monday.getDate() / 7)}`
                if (index > 0 && monday.getMonth() === mondays[index - 1].getMonth()) return [week, ""]
                const month = monday.toLocaleDateString("en-PH", { month: "short" })
                const withYear = index === 0 || index === newYear
                return [week, withYear ? `${month} ${monday.getFullYear()}` : month]
              },
            },
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: themeColor("--border") },
            ticks: { color: labelColor },
            title: { display: true, text: "Sold per week", color: labelColor },
          },
        },
      },
    }

    const instance = new Chart(canvasRef.current, { ...config, plugins: [forecastWeeks] })
    return () => instance.destroy()
  }, [beforeWeeks, chart, pastYears, totalWeeks])

  return <canvas aria-label="Weekly sales and forecast chart" ref={canvasRef} />
}
