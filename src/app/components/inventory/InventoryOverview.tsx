'use client'

import Link from 'next/link'
import { AlertTriangle, Plus, Warehouse as WarehouseIcon } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { fetchInventories } from '@/app/services/inventoryApi'
import { fetchWarehouses } from '@/app/services/warehouseApi'
import {
  getInventoryStatusStyleFromLabel,
  formatNumber,
  capitalize,
} from '@/app/utils/helpers/inventoryHelpers'
import Loading from '@/app/components/loaders/Loading'
import { PaginationDemo } from '@/app/components/Pagination'
import { queryKeys } from '@/app/utils/query/queryKeys'

const attentionItemsPerPage = 7

export default function InventoryOverview() {
  const [attentionPage, setAttentionPage] = useState(1)
  const inventoryQueryParams = { page: 1, pageSize: 100 }
  const { data: inventoriesResponse, isLoading } = useQuery({
    queryKey: queryKeys.inventories.all(inventoryQueryParams),
    queryFn: () => fetchInventories(inventoryQueryParams),
  })
  const inventories = inventoriesResponse?.items ?? []
  const criticalInventories = inventories.filter((item) => item.status === 'critical')
  const forecastWarningCount = criticalInventories.length

  const { data: warehouses = [], isLoading: isLoadingWarehouses, isError: isWarehouseError } = useQuery({
    queryKey: queryKeys.warehouses.all,
    queryFn: fetchWarehouses,
  })
  const allWarehouseRecord = warehouses.find(
    (warehouse) => warehouse.name.trim().toLowerCase() === 'all warehouse record'
  )
  const totalCapacity = allWarehouseRecord?.capacity ?? warehouses.reduce(
    (sum, warehouse) => sum + warehouse.capacity, 0
  )

  const statusCounts = {
    available: inventories.filter((x) => x.status === 'available').length,
    lowStock: inventories.filter((x) => x.status === 'low stock').length,
    critical: inventories.filter((x) => x.status === 'critical').length,
  }

  const attentionItems = inventories.filter(
    (item) => item.status === 'low stock' || item.status === 'critical'
  )

  const attentionTotalPages = Math.ceil(attentionItems.length / attentionItemsPerPage)
  const paginatedAttentionItems = attentionItems.slice(
    (attentionPage - 1) * attentionItemsPerPage,
    attentionPage * attentionItemsPerPage
  )

  return (
    <div className="flex h-full w-full xl:w-3/5 overflow-y-auto flex-col rounded-lg bg-[#EBF3ED] p-4 scrollbar-none">
      <div className="flex flex-wrap gap-4 lg:gap-0 items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#121514]">Inventory Overview</h2>
          <p className="mt-1 text-sm text-[#68716C]">Current inventory status</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/inventory#RawMaterials"
            className="inline-flex h-fit items-center gap-2 rounded-2xl bg-[#0c0d0d] px-3 py-2 text-xs font-medium text-white transition-all hover:bg-[#1B1C1C]"
          >
            <Plus className="h-4 w-4 text-white" />
            Add Inventory
          </Link>
          <Link
            href="/dashboard/inventory"
            className="flex items-center gap-1 text-sm font-medium text-[#767777] transition-all hover:text-[#121514]"
          >
            View
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4">
          <div className="flex items-center gap-2">
            <WarehouseIcon size={18} className="text-[#68716C]" />
            <span className="text-sm text-[#68716C]">Total warehouse capacity</span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-[#121514]">{isLoadingWarehouses || isWarehouseError ? '\u2014' : `${formatNumber(totalCapacity)} units`}</p>
          {isWarehouseError && <p role="alert" className="mt-1 text-xs text-red-600">Unable to load warehouse capacity.</p>}
        </div>

        <Link href="/dashboard/inventory#Risks" className="rounded-xl bg-white p-4 transition-colors hover:bg-[#FAFBFA]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-[#B42318]" />
            <span className="text-sm text-[#68716C]">Risks</span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-[#121514]">{isLoading ? '—' : forecastWarningCount}</p>
        </Link>
      </div>

      <div className="mt-5 rounded-xl bg-white p-4">
        <h3 className="text-sm font-medium text-[#121514]">Inventory</h3>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Available</span>
            <span className="font-medium">{statusCounts.available}</span>
          </div>

          <div className="flex justify-between">
            <span>Low Stock</span>
            <span className="font-medium">{statusCounts.lowStock}</span>
          </div>

          <div className="flex justify-between">
            <span>Critical</span>
            <span className="font-medium">{statusCounts.critical}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex-1 rounded-xl bg-white p-4">
        <h3 className="text-sm font-medium text-[#121514]">Needs Attention</h3>

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="text-sm text-[#68716C]">
              <span className='flex h-full'><Loading /></span>
            </div>
          ) : attentionItems.length === 0 ? (
            <p className="text-sm text-[#68716C]">Nothing needs attention right now.</p>
          ) : (
            paginatedAttentionItems.map((item) => {
              const statusStyle = getInventoryStatusStyleFromLabel(item.status)

              return (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-[#E7ECE8] p-3">
                  <div>
                    <p className="font-medium text-[#121514] capitalize">{item.name}</p>
                    <p className="text-xs text-[#68716C] capitalize">{item.warehouseName}</p>
                  </div>

                  <span className={`text-xs font-medium ${statusStyle.labelClassName}`}>
                    {capitalize(item.status)}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {!isLoading && attentionItems.length > attentionItemsPerPage && (
          <div className="mt-4 flex justify-center">
            <PaginationDemo
              currentPage={attentionPage}
              totalPages={attentionTotalPages}
              onPageChange={setAttentionPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
