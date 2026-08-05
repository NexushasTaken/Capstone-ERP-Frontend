'use client'

import { ArcElement, Chart, DoughnutController, Tooltip, type ChartConfiguration } from 'chart.js'
import { useEffect, useRef } from 'react'
import type { WarehouseCapacity } from '@/app/types/inventory'
import { formatNumber, getCapacityPercentage } from '@/app/utils/inventoryHelpers'

Chart.register(ArcElement, DoughnutController, Tooltip)

interface WarehouseCapacityChartProps {
  capacity: WarehouseCapacity
}

export default function WarehouseCapacityChart({ capacity }: WarehouseCapacityChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const percentage = getCapacityPercentage(capacity)

  useEffect(() => {
    if (!canvasRef.current) return

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Used capacity', 'Available capacity'],
        datasets: [{
          data: [capacity.used, capacity.total - capacity.used],
          backgroundColor: ['#111513', '#DDE5DF'],
          borderWidth: 0,
          borderRadius: 8,
          spacing: 3,
        }],
      },
      options: {
        cutout: '77%',
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (context) => `${context.label}: ${formatNumber(context.parsed)}` },
          },
        },
      },
    }

    const chart = new Chart(canvasRef.current, config)
    return () => chart.destroy()
  }, [capacity])

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center">
      <div className="relative h-52 w-52">
        <canvas ref={canvasRef} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-[#0c0d0d]">{percentage}%</span>
          <span className="mt-1 text-xs text-[#68716C]">space used</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-[#68716C]">
        <span className="font-medium text-[#0c0d0d]">{formatNumber(capacity.used)}</span> of {formatNumber(capacity.total)} units
      </p>
    </div>
  )
}
