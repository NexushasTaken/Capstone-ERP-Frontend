'use client'

import Link from 'next/link'
import { Warehouse as WarehouseIcon } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { fetchInventories } from '@/services/inventoryApi'
import { fetchDashboardInventory } from '@/services/dashboardApi'
import { getInventoryStatusStyleFromLabel, formatNumber, capitalize } from '@/lib/helpers/inventoryHelpers'
import Loading from '@/components/Loading'
import { TablePagination } from '@/components/TablePagination'
import { queryKeys } from '@/lib/query/queryKeys'

const attentionItemsPerPage = 7

export default function InventoryOverview() {
  const [attentionPage, setAttentionPage] = useState(1)
  const inventoryQueryParams = {
    page: attentionPage,
    pageSize: attentionItemsPerPage,
    statusId: 3,
  }
  const {
    data: inventoriesResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.inventories.all(inventoryQueryParams),
    queryFn: () => fetchInventories(inventoryQueryParams),
  })
  const inventories = inventoriesResponse?.items ?? []
  const criticalInventories = inventories.filter((item) => item.status === 'critical')
  const {
    data: dashboardInventory,
    isLoading: isDashboardInventoryLoading,
    isError: isDashboardInventoryError,
  } = useQuery({
    queryKey: queryKeys.dashboard.inventory,
    queryFn: ({ signal }) => fetchDashboardInventory(signal),
  })
  const totalCapacity = dashboardInventory?.totalWareHouseCapacity ?? 0

  const statusCounts = {
    available: dashboardInventory?.inventoryStatus.find((item) => item.status === 'available')?.total ?? 0,
    lowStock: dashboardInventory?.inventoryStatus.find((item) => item.status === 'low stock')?.total ?? 0,
    critical: dashboardInventory?.inventoryStatus.find((item) => item.status === 'critical')?.total ?? 0,
  }

  const attentionItems = criticalInventories
  const attentionTotalPages = inventoriesResponse?.pageCount ?? 0

  return (
    <div className="flex h-full w-full xl:w-3/5 overflow-y-auto flex-col rounded-lg bg-muted p-4 scrollbar-none">
      <div className="flex flex-wrap gap-4 lg:gap-0 items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Inventory Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">Current inventory status</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/inventory"
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
          >
            View
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1 rounded-xl bg-background p-4">
          <div className="flex items-center gap-2">
            <WarehouseIcon size={18} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total warehouse capacity</span>
          </div>
          <p className="mt-3 text-4xl font-semibold text-foreground">
            {isDashboardInventoryLoading || isDashboardInventoryError ? '-' : `${formatNumber(totalCapacity)} units`}
          </p>
          {isDashboardInventoryError && (
            <p role="alert" className="mt-1 text-xs text-destructive">
              Unable to load warehouse capacity.
            </p>
          )}
        </div>

        <div className="min-w-0 flex-1 rounded-xl bg-background p-4">
          <h3 className="text-sm font-medium text-foreground">Inventory</h3>

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
      </div>

      <div className="mt-5 flex-1 rounded-xl bg-background p-4">
        <h3 className="text-sm font-medium text-foreground">Needs attention for stock below reorder point.</h3>

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">
              <span className="flex h-full">
                <Loading />
              </span>
            </div>
          ) : isError ? (
            <p role="alert" className="text-sm text-destructive">
              Unable to load inventory needing attention.
            </p>
          ) : attentionItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing needs attention right now.</p>
          ) : (
            attentionItems.map((item) => {
              const statusStyle = getInventoryStatusStyleFromLabel(item.status)

              return (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-medium text-foreground capitalize">{item.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.warehouseName}</p>
                  </div>

                  <span className={`text-xs font-medium ${statusStyle.labelClassName}`}>{capitalize(item.status)}</span>
                </div>
              )
            })
          )}
        </div>

        {!isLoading && !isError && attentionTotalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <TablePagination
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
