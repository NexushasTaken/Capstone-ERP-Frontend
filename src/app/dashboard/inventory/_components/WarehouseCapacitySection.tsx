'use client'

import { useState } from 'react'
import { Plus, Warehouse } from 'lucide-react'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'
import Loading from '@/components/Loading'
import StatusAction from '@/components/StatusAction'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { formatNumber, isSelectableWarehouse } from '@/lib/helpers/inventoryHelpers'
import { editDeleteActions } from '@/lib/helpers/statusActionHelpers'
import { allowedActions, can } from '@/lib/permissions'
import type { InsertWarehousePayload, WarehouseListItem } from '@/types/warehouseCapacity'
import { useWarehouseMutations, useWarehouses } from '../_hooks/useWarehouses'
import {
  getTotalWarehouseCapacity,
  MAX_SELECTED_WAREHOUSES,
  toggleSelectedWarehouseId,
  toWarehouseCapacity,
} from '../_lib/warehouseCapacityHelpers'
import WarehouseCapacityChart from './WarehouseCapacityChart'
import WarehouseChartPicker from './WarehouseChartPicker'
import WarehouseFormModal from './WarehouseFormModal'

// Which modal is open, and for which warehouse.
type ModalState =
  | { type: 'add' }
  | { type: 'edit'; warehouse: WarehouseListItem }
  | { type: 'delete'; warehouse: WarehouseListItem }
  | null

export default function WarehouseCapacitySection() {
  const { data: currentUser } = useCurrentUser()
  const role = currentUser?.role
  const warehouseActions = allowedActions(role, 'warehouse', editDeleteActions)

  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<number[]>([])
  const [hasCustomSelection, setHasCustomSelection] = useState(false)
  const [modal, setModal] = useState<ModalState>(null)

  const { data: warehouses = [], isLoading } = useWarehouses()
  const mutations = useWarehouseMutations()

  // The backend includes an "all warehouse record" row with the overall totals; it isn't charted on its own.
  const allWarehouseRecord = warehouses.find((warehouse) => !isSelectableWarehouse(warehouse))
  const chartWarehouses = warehouses.filter(isSelectableWarehouse)
  const validSelectedIds = selectedWarehouseIds
    .filter((id) => chartWarehouses.some((warehouse) => warehouse.id === id))
    .slice(0, MAX_SELECTED_WAREHOUSES)
  // Until the user picks charts, show the first few warehouses.
  const visibleSelectedIds =
    hasCustomSelection || validSelectedIds.length > 0
      ? validSelectedIds
      : chartWarehouses.slice(0, MAX_SELECTED_WAREHOUSES).map((warehouse) => warehouse.id)
  const selectedWarehouses = chartWarehouses.filter((warehouse) => visibleSelectedIds.includes(warehouse.id))
  const totalCapacity = allWarehouseRecord
    ? toWarehouseCapacity(allWarehouseRecord)
    : getTotalWarehouseCapacity(chartWarehouses)
  const closeModal = () => setModal(null)

  function handleSubmitWarehouse(values: InsertWarehousePayload) {
    if (modal?.type === 'edit') {
      mutations.updateWarehouse.mutate({ id: modal.warehouse.id, ...values })
    } else {
      mutations.addWarehouse.mutate({ ...values, optimisticId: -Date.now() })
    }
    closeModal()
  }

  function handleDeleteWarehouse() {
    if (modal?.type !== 'delete') return
    mutations.deleteWarehouse.mutate(modal.warehouse.id)
    closeModal()
  }

  return (
    <section id="WarehouseCapacity" className="grid scroll-mt-6 gap-5">
      <article className="flex min-h-85 flex-col rounded-2xl border border-border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border pb-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-muted p-2 text-foreground">
              <Warehouse className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold text-foreground">Warehouse capacity</h2>
              <p className="text-sm text-muted-foreground">
                {formatNumber(chartWarehouses.length)} warehouses tracked
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:flex-row">
            <WarehouseChartPicker
              warehouses={chartWarehouses}
              selectedIds={visibleSelectedIds}
              onToggle={(warehouseId) => {
                setHasCustomSelection(true)
                setSelectedWarehouseIds(toggleSelectedWarehouseId(visibleSelectedIds, warehouseId))
              }}
            />

            {can(role, 'warehouse:add') && (
              <Button
                className="rounded-xl cursor-pointer px-3 py-2 text-sm"
                onClick={() => setModal({ type: 'add' })}
                type="button"
              >
                <Plus className="h-4 w-4" />
                Add warehouse
              </Button>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-foreground">Total capacity</h3>
              <p className="text-xs text-muted-foreground">All added warehouses</p>
            </div>
            <WarehouseCapacityChart capacity={totalCapacity} />
          </div>

          <div className="grid gap-4 xl:col-span-3 xl:grid-cols-3">
            {isLoading ? (
              <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-border bg-muted/50 text-sm text-muted-foreground xl:col-span-3">
                <Loading />
              </div>
            ) : selectedWarehouses.length === 0 ? (
              <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-border bg-muted/50 text-sm text-muted-foreground xl:col-span-3">
                Select warehouse charts from the dropdown.
              </div>
            ) : (
              selectedWarehouses.map((warehouse) => (
                <div className="rounded-xl border border-border bg-background p-4" key={warehouse.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-col">
                      <h3 className="truncate text-sm font-semibold text-foreground capitalize">
                        {warehouse.name}
                      </h3>
                      <p className="truncate text-xs text-muted-foreground">
                        {warehouse.address}
                      </p>
                    </div>
                    {warehouseActions.length > 0 && (
                      <StatusAction
                        actions={warehouseActions}
                        label={`More actions for warehouse ${warehouse.name}`}
                        onAction={(action) => {
                          if (action === 'edit') setModal({ type: 'edit', warehouse })
                          if (action === 'delete') setModal({ type: 'delete', warehouse })
                        }}
                      />
                    )}
                  </div>
                  <WarehouseCapacityChart capacity={toWarehouseCapacity(warehouse)} />
                </div>
              ))
            )}
          </div>
        </div>

        {(modal?.type === 'add' || modal?.type === 'edit') && (
          <WarehouseFormModal
            warehouse={modal.type === 'edit' ? modal.warehouse : null}
            disabled={mutations.isSubmitting}
            onClose={closeModal}
            onSubmit={handleSubmitWarehouse}
          />
        )}

        <DeleteConfirmModal
          open={modal?.type === 'delete'}
          onClose={closeModal}
          onConfirm={handleDeleteWarehouse}
          entityName="warehouse"
          subtitle="Warehouse capacity"
          itemLabel={modal?.type === 'delete' ? modal.warehouse.name : null}
          disabled={mutations.isSubmitting}
        />
      </article>
    </section>
  )
}
