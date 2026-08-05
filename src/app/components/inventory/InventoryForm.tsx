'use client'

import WarehouseCapacityChart from '@/app/components/inventory/WarehouseCapacityChart'
import MovementVelocity from '@/app/components/inventory/MovementVelocity'
import { inventoryDashboardData } from '@/app/utils/inventoryMockData'
import { getRiskStyle } from '@/app/utils/inventoryHelpers'
import { AlertTriangle, PackageCheck, Warehouse } from 'lucide-react'

export default function InventoryForm() {
  const { health, forecastWarningCount, warehouseCapacity, movementVelocity, predictedStockouts } = inventoryDashboardData
  const healthStyle = getRiskStyle(health.status)

  return (
    <main className="h-screen w-full overflow-y-auto p-6 lg:w-4/5">
      <div className="flex w-full flex-col gap-5">
        <header>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#0c0d0d]">Inventory</h1>
          <p className="mt-2 text-sm text-[#68716C]">Forecast inventory health and act on upcoming stockouts.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-[#DCE4DE] bg-white p-5 shadow-sm xl:col-span-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-[#68716C]">Inventory health</p>
                <p className="mt-2 text-4xl font-semibold text-[#0c0d0d]">{health.score}<span className="text-xl text-[#909994]">/100</span></p>
              </div>
              <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${healthStyle.className}`}>{healthStyle.label}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#68716C]">{health.summary}</p>
          </article>

          <article className="rounded-2xl border border-[#DCE4DE] bg-white p-5 shadow-sm xl:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#68716C]">Forecast risks</p>
              <span className="rounded-xl bg-[#FFF3D6] p-2 text-[#9A6700]"><AlertTriangle className="h-5 w-5" /></span>
            </div>
            <p className="mt-4 text-4xl font-semibold text-[#0c0d0d]">{forecastWarningCount}</p>
            <p className="mt-2 text-sm text-[#68716C]">products predicted to run out in the next 30 days</p>
          </article>

          <article className="rounded-2xl border border-[#DCE4DE] bg-[#EBF3ED] p-5 shadow-sm xl:col-span-1">
            <div className="flex items-center gap-2 text-[#0c0d0d]">
              <PackageCheck className="h-5 w-5" />
              <p className="text-sm font-medium">Replenishment status</p>
            </div>
            <p className="mt-4 text-xl font-semibold text-[#0c0d0d]">4 items need attention</p>
            <p className="mt-2 text-sm text-[#68716C]">Review the forecast list below to plan your next purchase order.</p>
          </article>
        </section>

        <section className="grid gap-5 xl:grid-cols-5">
          <article className="min-h-85 rounded-2xl border border-[#DCE4DE] bg-white p-5 shadow-sm xl:col-span-2">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-[#EBF3ED] p-2 text-[#0c0d0d]"><Warehouse className="h-5 w-5" /></span>
              <div>
                <h2 className="font-semibold text-[#0c0d0d]">Warehouse capacity</h2>
                <p className="text-sm text-[#68716C]">{warehouseCapacity.warehouse}</p>
              </div>
            </div>
            <div className="h-64"><WarehouseCapacityChart capacity={warehouseCapacity} /></div>
          </article>

          <article className="min-h-85 overflow-hidden rounded-2xl border border-[#DCE4DE] bg-white shadow-sm xl:col-span-3">
            <div className="flex items-center justify-between border-b border-[#E7ECE8] p-5">
              <div>
                <h2 className="font-semibold text-[#0c0d0d]">Predicted stockouts</h2>
                <p className="mt-1 text-sm text-[#68716C]">Products projected to stock out within 30 days</p>
              </div>
              <span className="rounded-lg bg-[#FBE7E7] px-2.5 py-1 text-xs font-semibold text-[#B42318]">{forecastWarningCount} risks</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-162.5 text-left text-sm">
                <thead className="bg-[#F7F9F7] text-xs uppercase tracking-wide text-[#68716C]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Available</th>
                    <th className="px-4 py-3 font-medium">Stockout date</th>
                    <th className="px-5 py-3 text-right font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7ECE8]">
                  {predictedStockouts.map((item) => {
                    const riskStyle = getRiskStyle(item.risk)
                    return (
                      <tr className="text-[#0c0d0d]" key={item.sku}>
                        <td className="px-5 py-4"><p className="font-medium">{item.product}</p><p className="mt-0.5 text-xs text-[#68716C]">{item.sku} · {item.warehouse}</p></td>
                        <td className="px-4 py-4">{item.availableUnits} units</td>
                        <td className="px-4 py-4 text-[#68716C]">{item.estimatedStockoutDate}</td>
                        <td className="px-5 py-4 text-right"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${riskStyle.className}`}>{riskStyle.label}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <div className="max-w-2xl">
          <MovementVelocity items={movementVelocity} />
        </div>
      </div>
    </main>
  )
}
