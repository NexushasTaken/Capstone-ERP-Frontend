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
} from "chart.js"
import { useEffect, useRef } from "react"
import AppModal, { ModalBody, ModalHeader } from "@/components/AppModal"
import Loading from "@/components/Loading"
import { formatDate } from "@/lib/format"
import { themeColor } from "@/lib/cssColor"
import type { DemandChart, DemandForecastItem } from "@/types/dashboard"
import { useDemandChart } from "../_hooks/useDemandForecast"
import { forecastMethodLabel, formatDemandRange, formatUnits } from "../_lib/forecastFormat"

Chart.register(CategoryScale, Filler, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip)

interface DemandChartDialogProps {
  product: DemandForecastItem
  onClose: () => void
}

// "Oct 5": the week a point starts on
function weekLabel(weekStart: string) {
  return new Date(`${weekStart}T00:00:00`).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
}

export default function DemandChartDialog({ product, onClose }: DemandChartDialogProps) {
  const chartQuery = useDemandChart(product.productId)
  const method = forecastMethodLabel[product.method]

  return (
    <AppModal className="xl:max-w-4xl" onClose={onClose} open>
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
            <DemandLineChart chart={chartQuery.data} />
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          {method?.hint} The shaded band is the 95% range: a normal month lands inside it.
          {product.aiErrorPercent != null &&
            product.baselineErrorPercent != null &&
            ` Over the last 12 weeks the AI was off by ±${Math.round(product.aiErrorPercent)}% for this product, a simple 4-week average by ±${Math.round(product.baselineErrorPercent)}%.`}
        </p>
      </ModalBody>
    </AppModal>
  )
}

function DemandLineChart({ chart }: { chart: DemandChart }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const history = chart.history
    const forecast = chart.forecast
    const labels = [...history, ...forecast].map((point) => weekLabel(point.weekStart))
    const gap = (count: number) => Array<number | null>(count).fill(null)

    // The forecast lines start at the last actual week so they join the actual line
    const lastActual = history.at(-1)?.demand ?? null
    const joined = (values: number[]) => [...gap(Math.max(0, history.length - 1)), lastActual, ...values]

    const actualColor = themeColor("--chart-5")
    const forecastColor = themeColor("--chart-3")
    const labelColor = themeColor("--muted-foreground")

    const config: ChartConfiguration<"line", (number | null)[], string> = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Actual demand",
            data: [...history.map((point) => point.demand), ...gap(forecast.length)],
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
              !(item.datasetIndex > 0 && item.dataIndex === history.length - 1),
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

    const instance = new Chart(canvasRef.current, config)
    return () => instance.destroy()
  }, [chart])

  return <canvas aria-label="Weekly demand and forecast chart" ref={canvasRef} />
}
