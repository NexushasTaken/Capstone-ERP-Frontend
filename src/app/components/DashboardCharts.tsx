'use client'

import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  Tooltip,
  type ChartConfiguration,
} from 'chart.js'
import { useEffect, useRef } from 'react'

Chart.register(ArcElement, BarController, BarElement, CategoryScale, LinearScale, LineController, LineElement, PieController, PointElement, Tooltip)

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

const fulfillmentPerformanceData = {
  labels: ['12 Aug', '13 Aug', '14 Aug', '15 Aug', '16 Aug', '17 Aug', '18 Aug', '19 Aug', '20 Aug', '21 Aug', '22 Aug', '23 Aug', '24 Aug', '25 Aug', '26 Aug'],
  datasets: [
    {
      data: [38, 76, 52, 61, 47, 94, 64, 98, 63, 84, 60, 24, 44, 58, 89],
      backgroundColor: (context: { dataIndex: number }) =>
        context.dataIndex === 7 ? '#111513' : 'rgba(77, 88, 82, 0.28)',
      borderRadius: 2,
      borderSkipped: false,
      barPercentage: 0.62,
      categoryPercentage: 0.9,
    },
  ],
}

function FulfillmentCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    let delayed = false

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: fulfillmentPerformanceData,
      options: {
        animation: {
          onComplete: () => {
            delayed = true
          },
          delay: (context) => {
            if (context.type === 'data' && context.mode === 'default' && !delayed) {
              return context.dataIndex * 300 + context.datasetIndex * 100
            }

            return 0
          },
        },
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (context) => `${context.parsed.y}% of weekly target` },
          },
        },
        scales: {
          x: {
            display: false,
            grid: { display: false },
            border: { display: false },
          },
          y: {
            min: 0,
            max: 100,
            position: 'right',
            ticks: {
              stepSize: 50,
              callback: (value) => `${value}%`,
              color: '#68716C',
            },
            grid: {
              color: '#DCE4DE',
            },
            border: { display: false },
          },
        },
      },
    }

    const chart = new Chart(canvasRef.current, config)

    chart.stop()
    chart.reset()
    const animationFrame = requestAnimationFrame(() => chart.update('default'))

    return () => {
      cancelAnimationFrame(animationFrame)
      chart.destroy()
    }
  }, [])

  return <canvas ref={canvasRef} />
}

export function FulfillmentChart() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between px-1">
        <p className="text-xs text-[#68716C]">06 Aug</p>
      </div>
      <div className="relative min-h-0 flex-1 pt-2">
        <FulfillmentCanvas />
      </div>
    </div>
  )
}

const salesOverviewData = [
  { total: 156646 },
  { total: 86163 },
  { total: 198116 },
]

export type SalesChartType = 'line' | 'pie' | 'bar'

function getLastCompletedMonthLabels(referenceDate = new Date()) {
  return Array.from({ length: 3 }, (_, index) => {
    const monthOffset = 3 - index
    const monthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - monthOffset, 1)

    return monthDate.toLocaleString('en-US', { month: 'long' })
  })
}

interface SalesChartProps {
  type?: SalesChartType
}

export function SalesChart({ type = 'line' }: SalesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const labels = getLastCompletedMonthLabels()
    const totals = salesOverviewData.map((month) => month.total)

    const config: ChartConfiguration = {
      type,
      data: {
        labels,
        datasets: [
          {
            label: 'Sales',
            data: totals,
            borderColor: '#111513',
            backgroundColor: type === 'pie'
              ? ['#111513', '#7A8B80', '#D6DED8']
              : 'rgba(17, 21, 19, 0.12)',
            borderWidth: 3,
            borderRadius: type === 'bar' ? 4 : undefined,
            borderSkipped: type === 'bar' ? false : undefined,
            barPercentage: type === 'bar' ? 0.5 : undefined,
            categoryPercentage: type === 'bar' ? 0.8 : undefined,
            pointStyle: 'circle',
            pointRadius: 8,
            pointHoverRadius: 12,
            pointBackgroundColor: '#EBF3ED',
            pointBorderColor: '#111513',
            pointBorderWidth: 3,
            tension: 0.35,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Sales: ${pesoFormatter.format(context.parsed.y ?? 0)}`,
            },
          },
        },
        scales: type === 'pie' ? undefined : {
          x: {
            border: { display: false },
            grid: { display: false },
            ticks: {
              color: '#4E5752',
              font: { size: 12, weight: 500 },
            },
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: '#DCE4DE' },
            ticks: {
              color: '#68716C',
              callback: (value) => `${Number(value) / 1000}K`,
            },
          },
        },
      },
    }

    const chart = new Chart(canvasRef.current, config)
    return () => chart.destroy()
  }, [type])

  return (
    <div className="h-full max-h-76 w-full">
      <canvas aria-label={`Sales overview ${type} chart for the last three completed months`} ref={canvasRef} />
    </div>
  )
}
