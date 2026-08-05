'use client'

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  Tooltip,
  type ChartConfiguration,
} from 'chart.js'
import { useEffect, useRef, useState } from 'react'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

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

    // Start after the canvas has been measured so the stagger is visible on refresh.
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

type FulfillmentColumn = {
  total: string
  segments: number[]
}

const salesOverviewData: FulfillmentColumn[] = [
  { total: '₱156,646', segments: [20, 16, 12, 35, 17] },
  { total: '₱86,163', segments: [16, 15, 17, 17, 20] },
  { total: '₱198,116', segments: [20, 16, 15, 18, 31] },
]

const segmentColors = ['#B9C0BB', '#909994', '#6C7570', '#414944', '#111513']
const columnPositions = [20, 142, 264]

export function SalesChart() {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const segmentHeight = 12
  const gap = 1
  const bottom = 130

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => setShouldAnimate(true))
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  const segmentY = (columnIndex: number, segmentIndex: number) => {
    const priorHeight = salesOverviewData[columnIndex].segments
      .slice(0, segmentIndex)
      .reduce((sum, value) => sum + value, 0)
    return bottom - priorHeight - segmentIndex * gap - salesOverviewData[columnIndex].segments[segmentIndex]
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <svg
        aria-label="Mock Sales Overview Chart"
        className="min-h-0 flex-1"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        viewBox="0 0 340 164"
      >
        {salesOverviewData.slice(0, -1).flatMap((column, columnIndex) =>
          column.segments.map((_, segmentIndex) => {
            const startX = columnPositions[columnIndex] + 42
            const endX = columnPositions[columnIndex + 1]
            const startY = segmentY(columnIndex, segmentIndex) + segmentHeight / 2
            const endY = segmentY(columnIndex + 1, segmentIndex) + segmentHeight / 2
            return (
              <path
                className={shouldAnimate ? 'sales-flow-line' : 'sales-flow-line sales-flow-line--hidden'}
                d={`M ${startX} ${startY} C ${startX + 36} ${startY}, ${endX - 36} ${endY}, ${endX} ${endY}`}
                fill="none"
                key={`${columnIndex}-${segmentIndex}`}
                style={{ animationDelay: `${(columnIndex + 1) * 550 + segmentIndex * 75}ms` }}
                stroke="#DDE5DF"
                strokeWidth="2"
              />
            )
          }),
        )}

        {salesOverviewData.map((column, columnIndex) => (
          <g key={column.total}>
            <text fill="#111513" fontSize="10" fontWeight="600" textAnchor="middle" x={columnPositions[columnIndex] + 21} y="14">
              {String.fromCodePoint(0x20B1)}{column.total.replace(/^\D+/, '')}
            </text>
            {column.segments.map((height, segmentIndex) => (
              <rect
                className={shouldAnimate ? 'sales-flow-block' : 'sales-flow-block sales-flow-block--hidden'}
                fill={segmentColors[segmentIndex]}
                height={height}
                key={segmentIndex}
                rx="3"
                style={{ animationDelay: `${(columnIndex * column.segments.length + segmentIndex) * 100}ms` }}
                width="42"
                x={columnPositions[columnIndex]}
                y={segmentY(columnIndex, segmentIndex)}
              />
            ))}
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mb-4 text-sm text-[#4E5752]">
        {['CPH', 'CPH 2', 'CPH 3', 'CPH 4', 'Other'].map((label, index) => (
          <span className="flex items-center gap-1" key={label}>
            <i className="h-2 w-2 rounded-sm" style={{ backgroundColor: segmentColors[index] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
