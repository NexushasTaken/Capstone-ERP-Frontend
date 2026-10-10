"use client"

import { Chart, type ChartConfiguration, type Plugin } from "chart.js"
import { useEffect, useRef, useState } from "react"
import Loading from "@/components/Loading"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"
import { themeColor } from "@/lib/cssColor"
import { formatUnits } from "@/lib/forecastFormat"
import { useDemandBacktest } from "@/hooks/useDemandForecast"
import { ForecastMethod, type DemandBacktest, type DemandForecastItem } from "@/types/dashboard"

interface DemandBacktestSectionProps {
  product: DemandForecastItem
}

// How many weeks to hide from the AI
const HIDDEN_CHOICES = [4, 8, 12, 26, 52]

// Where the hidden weeks end: weeks before now (the backend accepts only these)
const END_CHOICES = [
  { weeksAgo: 0, label: "Now" },
  { weeksAgo: 13, label: "3 months ago" },
  { weeksAgo: 26, label: "6 months ago" },
  { weeksAgo: 39, label: "9 months ago" },
]

// The AI needs 2 years of sales before the hidden weeks to see the yearly season twice
const MIN_TRAIN_WEEKS = 104

// Tests longer than this look much further ahead than the app's own 4-week forecast
const LONG_TEST_WEEKS = 26

// "Oct 5": the week a point starts on
function weekLabel(weekStart: string) {
  return new Date(`${weekStart}T00:00:00`).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
}

/**
 * The backtest made visible: hide some weeks of a product's sales, let the AI predict them from the weeks
 * before, and draw its guess next to what really sold and next to the simple 4-week average.
 */
export default function DemandBacktestSection({ product }: DemandBacktestSectionProps) {
  const [hiddenWeeks, setHiddenWeeks] = useState(12)
  const [endWeeksAgo, setEndWeeksAgo] = useState(0)

  // Enough history before the hidden weeks for the AI to learn from?
  const fits = (hidden: number, end: number) => product.historyWeeks - end - hidden >= MIN_TRAIN_WEEKS
  const usesAi = product.method === ForecastMethod.YearlySsa

  const testQuery = useDemandBacktest(product.productId, { hiddenWeeks, endWeeksAgo }, usesAi)
  const test = testQuery.data

  if (!usesAi) {
    return (
      <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
        This product isn&apos;t forecast by the AI, so there is nothing to test. The AI needs about 2¼ years of sales.
      </p>
    )
  }

  // Picking a longer test moves its end closer to now when there isn't enough history otherwise
  const chooseHidden = (hidden: number) => {
    setHiddenWeeks(hidden)
    if (!fits(hidden, endWeeksAgo)) {
      const end = END_CHOICES.map((choice) => choice.weeksAgo).findLast((weeksAgo) => fits(hidden, weeksAgo))
      setEndWeeksAgo(end ?? 0)
    }
  }

  return (
    <section aria-label="Forecast test" className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <p className="text-sm text-muted-foreground">
        The test hides some weeks of real sales from the AI, lets it predict them from the weeks before, and compares
        its guess with what really sold and with a simple 4-week average.
      </p>

      <div aria-label="Weeks to hide" className="flex flex-wrap items-center gap-2" role="group">
        <span className="w-14 text-sm text-muted-foreground">Hide</span>
        {HIDDEN_CHOICES.map((hidden) => (
          <Button
            aria-pressed={hiddenWeeks === hidden}
            disabled={!fits(hidden, 0)}
            key={hidden}
            onClick={() => chooseHidden(hidden)}
            size="sm"
            type="button"
            variant={hiddenWeeks === hidden ? "default" : "outline"}
          >
            {hidden} weeks
          </Button>
        ))}
      </div>

      <div aria-label="When the hidden weeks end" className="flex flex-wrap items-center gap-2" role="group">
        <span className="w-14 text-sm text-muted-foreground">Ending</span>
        {END_CHOICES.map((choice) => (
          <Button
            aria-pressed={endWeeksAgo === choice.weeksAgo}
            disabled={!fits(hiddenWeeks, choice.weeksAgo)}
            key={choice.weeksAgo}
            onClick={() => setEndWeeksAgo(choice.weeksAgo)}
            size="sm"
            type="button"
            variant={endWeeksAgo === choice.weeksAgo ? "default" : "outline"}
          >
            {choice.label}
          </Button>
        ))}
      </div>

      {test?.testable && test.weeks.length > 0 && (
        <p className="text-sm">
          Hiding <span className="font-medium">{formatDate(test.weeks[0].weekStart)}</span> to{" "}
          <span className="font-medium">{formatDate(test.weeks.at(-1)!.weekStart)}</span> ({test.hiddenWeeks} weeks).
          The AI learned from the {test.trainWeeks} weeks before.
        </p>
      )}

      <div className="h-72 w-full">
        {testQuery.isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loading />
          </div>
        ) : testQuery.error ? (
          <p className="text-center text-sm text-destructive">
            {testQuery.error instanceof Error ? testQuery.error.message : "Failed to load the test"}
          </p>
        ) : test && !test.testable ? (
          <p className="text-center text-sm text-muted-foreground">
            Not enough sales history for this test. The AI needs 2 years of sales before the hidden weeks.
          </p>
        ) : test ? (
          <BacktestLineChart test={test} />
        ) : null}
      </div>

      {test?.testable && test.aiErrorPercent != null && test.baselineErrorPercent != null && (
        <p className="text-sm">
          Over these {test.hiddenWeeks} weeks the AI was off by{" "}
          <span className="font-medium">±{Math.round(test.aiErrorPercent)}%</span>, a simple 4-week average by{" "}
          <span className="font-medium">±{Math.round(test.baselineErrorPercent)}%</span>. Lower is better.
        </p>
      )}

      {hiddenWeeks >= LONG_TEST_WEEKS && (
        <p className="text-sm text-amber-700">
          This tests a forecast {hiddenWeeks} weeks ahead. The app itself only forecasts 4 weeks ahead, so misses here
          are larger than in daily use.
        </p>
      )}
    </section>
  )
}

function BacktestLineChart({ test }: { test: DemandBacktest }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || test.weeks.length === 0) return

    const before = test.before
    const weeks = test.weeks
    const labels = [...before, ...weeks].map((point) => weekLabel(point.weekStart))
    const beforeGap = Array<number | null>(before.length).fill(null)
    // The AI's lines only cover the hidden weeks
    const hiddenOnly = (values: number[]) => [...beforeGap, ...values]

    const actualColor = themeColor("--chart-5")
    const aiColor = themeColor("--chart-3")
    const baselineColor = themeColor("--chart-2")
    const labelColor = themeColor("--muted-foreground")
    const hiddenWeeksColor = themeColor("--chart-3", 0.08)

    // Highlights the hidden weeks behind every line
    const hiddenWeeksBand: Plugin<"line"> = {
      id: "hiddenWeeks",
      beforeDatasetsDraw: ({ ctx, chartArea, scales }) => {
        const left = scales.x.getPixelForValue(before.length - 0.5)
        const right = scales.x.getPixelForValue(before.length + weeks.length - 0.5)
        ctx.save()
        ctx.fillStyle = hiddenWeeksColor
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
            label: "Real sales",
            data: [...before.map((point) => point.demand), ...weeks.map((week) => week.actual)],
            borderColor: actualColor,
            backgroundColor: actualColor,
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.3,
          },
          {
            label: "Low",
            data: hiddenOnly(weeks.map((week) => week.low)),
            borderWidth: 0,
            pointRadius: 0,
            tension: 0.3,
          },
          {
            label: "95% range",
            data: hiddenOnly(weeks.map((week) => week.busyCase)),
            borderWidth: 0,
            pointRadius: 0,
            backgroundColor: themeColor("--chart-3", 0.2),
            fill: "-1",
            tension: 0.3,
          },
          {
            label: "AI forecast",
            data: hiddenOnly(weeks.map((week) => week.expected)),
            borderColor: aiColor,
            backgroundColor: aiColor,
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.3,
          },
          {
            label: "Simple guess",
            data: hiddenOnly(weeks.map((week) => week.baseline)),
            borderColor: baselineColor,
            backgroundColor: baselineColor,
            borderDash: [2, 3],
            borderWidth: 2,
            pointRadius: 0,
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
            filter: (item) => item.dataset.label !== "Low" && item.raw !== null,
            callbacks: {
              label: (context) => {
                if (context.dataset.label === "95% range") {
                  const low = weeks[context.dataIndex - before.length]?.low ?? 0
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

    const instance = new Chart(canvasRef.current, { ...config, plugins: [hiddenWeeksBand] })
    return () => instance.destroy()
  }, [test])

  return <canvas aria-label="Forecast test chart: real sales, AI forecast and simple guess" ref={canvasRef} />
}
