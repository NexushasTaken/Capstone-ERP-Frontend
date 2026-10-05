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
  Legend,
  PieController,
  PointElement,
  Tooltip,
  type ChartConfiguration,
} from 'chart.js'
import { useEffect, useRef } from 'react'
import { themeColor } from '@/lib/cssColor'

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  Tooltip,
)

// The pie keeps its own multi-colour palette: the theme's --chart-1..5 are greys, too few to tell slices apart.
const salesPieColors = [
  '#1F618D',
  '#CB4335',
  '#F1C40F',
  '#27AE60',
  '#884EA0',
  '#D35400',
  '#148F77',
  '#2E86C1',
  '#C0392B',
  '#7D3C98',
  '#B7950B',
  '#117864',
]

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

export type SalesChartType = 'line' | 'pie' | 'bar'

interface SalesChartProps {
  type?: SalesChartType
  labels: string[]
  values: number[]
}

function getTooltipValue(context: { parsed: unknown; raw: unknown }) {
  if (typeof context.parsed === 'number') return context.parsed
  if (
    context.parsed &&
    typeof context.parsed === 'object' &&
    'y' in context.parsed &&
    typeof context.parsed.y === 'number'
  ) {
    return context.parsed.y
  }
  if (typeof context.raw === 'number') return context.raw

  return 0
}

export function SalesChart({ type = 'line', labels, values }: SalesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const pieColors = labels.map((_, index) => salesPieColors[index % salesPieColors.length])
    const lineColor = themeColor('--chart-5')
    const labelColor = themeColor('--muted-foreground')
    const config: ChartConfiguration = {
      type,
      data: {
        labels,
        datasets: [
          {
            label: 'Sales',
            data: values,
            borderColor: lineColor,
            backgroundColor: type === 'pie' ? pieColors : themeColor('--chart-5', 0.12),
            borderWidth: 3,
            borderRadius: type === 'bar' ? 4 : undefined,
            borderSkipped: type === 'bar' ? false : undefined,
            barPercentage: type === 'bar' ? 0.5 : undefined,
            categoryPercentage: type === 'bar' ? 0.8 : undefined,
            pointStyle: 'circle',
            pointRadius: 8,
            pointHoverRadius: 12,
            pointBackgroundColor: themeColor('--background'),
            pointBorderColor: lineColor,
            pointBorderWidth: 3,
            tension: 0.35,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: type === 'pie',
            position: 'bottom',
            labels: {
              boxHeight: 10,
              boxWidth: 10,
              color: labelColor,
              padding: 16,
              usePointStyle: true,
            },
            onHover: (_event, item, legend) => {
              const dataset = legend.chart.data.datasets[0]
              dataset.backgroundColor = pieColors.map((color, index) => (index === item.index ? color : `${color}4D`))
              legend.chart.update('none')
            },
            onLeave: (_event, _item, legend) => {
              legend.chart.data.datasets[0].backgroundColor = [...pieColors]
              legend.chart.update('none')
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => `Sales: ${pesoFormatter.format(getTooltipValue(context))}`,
            },
          },
        },
        scales:
          type === 'pie'
            ? undefined
            : {
                x: {
                  border: { display: false },
                  grid: { display: false },
                  ticks: {
                    color: labelColor,
                    font: { size: 12, weight: 500 },
                  },
                },
                y: {
                  beginAtZero: true,
                  border: { display: false },
                  grid: { color: themeColor('--border') },
                  ticks: {
                    color: labelColor,
                    callback: (value) => `${Number(value) / 1000}K`,
                  },
                },
              },
      },
    }

    const chart = new Chart(canvasRef.current, config)
    return () => chart.destroy()
  }, [labels, type, values])

  return (
    <div className="h-full max-h-76 w-full">
      <canvas aria-label={`Sales overview ${type} chart`} ref={canvasRef} />
    </div>
  )
}
