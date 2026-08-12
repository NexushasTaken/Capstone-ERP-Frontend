import Link from 'next/link'
import { AlertTriangle, Plus, Warehouse } from 'lucide-react'

import {
  inventoryDashboardData,
  mockRawMaterials,
} from '@/app/utils/inventoryMockData'

import {
  getRiskStyle,
  getRawMaterialStatusStyle,
} from '@/app/utils/inventoryHelpers'

export default function InventoryOverview() {
  const {
    health,
    forecastWarningCount,
    warehouseCapacity,
  } = inventoryDashboardData

  const healthStyle = getRiskStyle(health.status)

  const warehouseUsage = Math.round(
    (warehouseCapacity.used / warehouseCapacity.total) * 100
  )

  const statusCounts = {
    inStock: mockRawMaterials.filter(
      (x) => x.status === 'In stock'
    ).length,
    lowStock: mockRawMaterials.filter(
      (x) => x.status === 'Low stock'
    ).length,
    critical: mockRawMaterials.filter(
      (x) => x.status === 'Critical'
    ).length,
  }

  const attentionMaterials = mockRawMaterials.filter(
    (item) =>
      item.status === 'Low stock' ||
      item.status === 'Critical'
  )

  return (
    <div className="flex h-full w-full lg:w-2/5 overflow-y-auto flex-col rounded-lg bg-[#EBF3ED] p-5 scrollbar-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#121514]">
            Inventory Overview
          </h2>
          <p className="mt-1 text-sm text-[#68716C]">
            Current inventory health
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/inventory#RawMaterials"
            className="inline-flex h-fit items-center gap-2 rounded-2xl bg-[#0c0d0d] px-3 py-2 text-xs font-medium text-white transition-all hover:bg-[#1B1C1C]"
          >
            <Plus className="h-4 w-4 text-white" />
            Add Raw Material
          </Link>
          <Link
            href="/dashboard/inventory"
            className="flex items-center gap-1 text-sm font-medium text-[#767777] transition-all hover:text-[#121514]"
          >
            View
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#68716C]">
              Inventory Health
            </p>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-4xl font-semibold text-[#121514]">
                {health.score}
              </span>

              <span className="mb-1 text-[#909994]">
                /100
              </span>
            </div>
          </div>

          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${healthStyle.className}`}
          >
            {healthStyle.label}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4">
          <div className="flex items-center gap-2">
            <Warehouse
              size={18}
              className="text-[#68716C]"
            />

            <span className="text-sm text-[#68716C]">
              Warehouse
            </span>
          </div>

          <p className="mt-3 text-2xl font-semibold text-[#121514]">
            {warehouseUsage}%
          </p>
        </div>

        <Link href="/dashboard/inventory#Risks" className="rounded-xl bg-white p-4 transition-colors hover:bg-[#FAFBFA]">
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={18}
              className="text-[#B42318]"
            />

            <span className="text-sm text-[#68716C]">
              Risks
            </span>
          </div>

          <p className="mt-3 text-2xl font-semibold text-[#121514]">
            {forecastWarningCount}
          </p>
        </Link>
      </div>

      <div className="mt-5 rounded-xl bg-white p-4">
        <h3 className="text-sm font-medium text-[#121514]">
          Raw Materials
        </h3>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span>In Stock</span>
            <span className="font-medium">
              {statusCounts.inStock}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Low Stock</span>
            <span className="font-medium">
              {statusCounts.lowStock}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Critical</span>
            <span className="font-medium">
              {statusCounts.critical}
            </span>
          </div>

        </div>
      </div>

      <div className="mt-5 flex-1 rounded-xl bg-white p-4">
        <h3 className="text-sm font-medium text-[#121514]">
          Needs Attention
        </h3>

        <div className="mt-4 space-y-3">
          {attentionMaterials.map((item) => {
            const statusStyle =
              getRawMaterialStatusStyle(item.status)

            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-[#E7ECE8] p-3"
              >
                <div>
                  <p className="font-medium text-[#121514]">
                    {item.material}
                  </p>

                  <p className="text-xs text-[#68716C]">
                    {item.warehouse}
                  </p>
                </div>

                <span
                  className={`text-xs font-medium ${statusStyle.labelClassName}`}
                >
                  {item.status}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
