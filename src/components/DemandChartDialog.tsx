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
import { forecastMethodLabel, formatDemandRange, formatUnits } from "@/lib/forecastFormat"

Chart.register(CategoryScale, Filler, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip)

interface DemandChartDialogProps {
  product: DemandForecastItem
  onClose: () => void
}

// The chart shows 13 weeks (3 months) either side of the forecast start
const SEASON_WEEKS = 13

// How many earlier years to lay over this year; 0 is all of them
const YEAR_CHOICES = [1, 2, 3, 0]

// "Oct 5": the week a point starts on
function weekLabel(date: Date) {
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" })
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

// "12% higher" / "8% lower" / "About the same": the forecast against what sold in those weeks that year
function versusForecast(expected: number, sold: number | null) {
  if (sold === null || sold <= 0) return "—"
  const percent = Math.round(((expected - sold) / sold) * 100)
  if (percent === 0) return "About the same"
  return `${Math.abs(percent)}% ${percent > 0 ? "higher" : "lower"}`
}

export default function DemandChartDialog({ product, onClose }: DemandChartDialogProps) {
  const [yearsChoice, setYearsChoice] = useState(2)
  // Off every time the dialog opens: the dialog unmounts when it closes
  const [showTest, setShowTest] = useState(false)
  const chartQuery = useDemandChart(product.productId)
  const method = forecastMethodLabel[product.method]
  const allPastYears = useMemo(() => chartQuery.data?.pastYears ?? [], [chartQuery.data])
  const pastYears = useMemo(
    () => (yearsChoice === 0 ? allPastYears : allPastYears.slice(0, yearsChoice)),
    [allPastYears, yearsChoice],
  )
  // Only offer counts the product has; "All" only when it adds more than 3
  const choices = YEAR_CHOICES.filter((count) => (count === 0 ? allPastYears.length > 3 : count <= allPastYears.length))

  return (
    <AppModal className="overflow-y-auto xl:max-h-[90vh] xl:max-w-4xl" onClose={onClose} open>
      <ModalHeader
        onClose={onClose}
        subtitle="Weekly demand"
        title={<span className="capitalize">{product.name}</span>}
      />
      <ModalBody>
        <dl className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Next 4 weeks</dt>
            <dd className="font-medium">
              {formatDemandRange(product.expectedDemand, product.lowDemand, product.busyDemand)}
            </dd>
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

        {choices.length > 1 && (
          <div aria-label="Earlier years to compare" className="flex flex-wrap items-center gap-2" role="group">
            <span className="text-sm text-muted-foreground">Compare with</span>
            {choices.map((count) => (
              <Button
                aria-pressed={yearsChoice === count}
                key={count}
                onClick={() => setYearsChoice(count)}
                size="sm"
                type="button"
                variant={yearsChoice === count ? "default" : "outline"}
              >
                {count === 0 ? "All years" : count === 1 ? "Last year" : `${count} years`}
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
            <DemandLineChart chart={chartQuery.data} pastYears={pastYears} />
          ) : null}
        </div>

        {chartQuery.data && <SameWeeksTable pastYears={pastYears} product={product} />}

        <p className="text-xs text-muted-foreground">
          {method?.hint} The shaded band is the 95% range: a normal month lands inside it. The grey lines are the same
          weeks in earlier years, lighter the older the year, and the highlighted weeks are the ones being forecast.
          {product.aiErrorPercent != null &&
            product.baselineErrorPercent != null &&
            ` Over the last 12 weeks the AI was off by ±${Math.round(product.aiErrorPercent)}% for this product, a simple 4-week average by ±${Math.round(product.baselineErrorPercent)}%.`}
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

// The forecast's 4 weeks next to what sold in the same 4 weeks of each earlier year
function SameWeeksTable({ product, pastYears }: { product: DemandForecastItem; pastYears: DemandPastYear[] }) {
  return (
    <Table className="text-sm">
      <TableHeader>
        <TableRow>
          <TableHead>Same 4 weeks</TableHead>
          <TableHead className="text-right">Units</TableHead>
          <TableHead className="text-right">Forecast is</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Forecast</TableCell>
          <TableCell className="text-right font-medium">
            {formatDemandRange(product.expectedDemand, product.lowDemand, product.busyDemand)}
          </TableCell>
          <TableCell />
        </TableRow>
        {pastYears.map((pastYear) => (
          <TableRow key={pastYear.year}>
            <TableCell>{pastYear.year}</TableCell>
            <TableCell className="text-right">
              {pastYear.sameWeeksTotal === null ? "—" : formatUnits(pastYear.sameWeeksTotal)}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {versusForecast(product.expectedDemand, pastYear.sameWeeksTotal)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function DemandLineChart({ chart, pastYears }: { chart: DemandChart; pastYears: DemandPastYear[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const history = chart.history
    const forecast = chart.forecast
    if (forecast.length === 0) return

    // 26 weeks: 13 before the forecast start (index SEASON_WEEKS) and 13 from it
    const forecastStart = new Date(`${forecast[0].weekStart}T00:00:00`)
    const labels = Array.from({ length: 2 * SEASON_WEEKS }, (_, i) =>
      weekLabel(addWeeks(forecastStart, i - SEASON_WEEKS)),
    )
    const gap = (count: number) => Array<number | null>(count).fill(null)
    const afterForecast = gap(SEASON_WEEKS - forecast.length)

    // A newer product has fewer than 13 weeks before the forecast
    const actual = [...gap(SEASON_WEEKS - history.length), ...history.map((point) => point.demand)]

    // The forecast lines start at the last actual week so they join the actual line
    const lastActual = history.at(-1)?.demand ?? null
    const joined = (values: number[]) => [...gap(SEASON_WEEKS - 1), lastActual, ...values, ...afterForecast]

    const actualColor = themeColor("--chart-5")
    const forecastColor = themeColor("--chart-3")
    const labelColor = themeColor("--muted-foreground")
    const forecastWeeksColor = themeColor("--chart-3", 0.08)

    // Highlights the forecast weeks behind every line
    const forecastWeeks: Plugin<"line"> = {
      id: "forecastWeeks",
      beforeDatasetsDraw: ({ ctx, chartArea, scales }) => {
        const left = scales.x.getPixelForValue(SEASON_WEEKS - 0.5)
        const right = scales.x.getPixelForValue(SEASON_WEEKS + forecast.length - 0.5)
        ctx.save()
        ctx.fillStyle = forecastWeeksColor
        ctx.fillRect(left, chartArea.top, right - left, chartArea.bottom - chartArea.top)
        ctx.restore()
      },
    }

    const config: ChartConfiguration<"line", (number | null)[], string> = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Actual demand",
            data: [...actual, ...gap(SEASON_WEEKS)],
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
            label: "95% range",
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
            return {
              label: String(pastYear.year),
              data: pastYear.weeks,
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
              !(item.datasetIndex >= 1 && item.datasetIndex <= 3 && item.dataIndex === SEASON_WEEKS - 1),
            callbacks: {
              label: (context) => {
                if (context.dataset.label === "95% range") {
                  const low = context.chart.data.datasets[1].data[context.dataIndex] as number
                  return `95% range: ${formatUnits(low)}–${formatUnits(context.parsed.y ?? 0)}`
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
            ticks: { color: labelColor, maxRotation: 0, autoSkipPadding: 12 },
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: themeColor("--border") },
            ticks: { color: labelColor },
            title: { display: true, text: "Units per week", color: labelColor },
          },
        },
      },
    }

    const instance = new Chart(canvasRef.current, { ...config, plugins: [forecastWeeks] })
    return () => instance.destroy()
  }, [chart, pastYears])

  return <canvas aria-label="Weekly demand and forecast chart" ref={canvasRef} />
}
