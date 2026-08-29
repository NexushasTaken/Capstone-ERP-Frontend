'use client'

import { useEffect, useState } from 'react'
import { Check, CheckSquare, Plus, Warehouse } from 'lucide-react'

import CloseButton from '@/app/components/CloseButton'
import AppModal from '@/app/components/modals/AppModal'
import WarehouseCapacityChart from '@/app/components/inventory/WarehouseCapacityChart'
import { formatNumber } from '@/app/utils/helpers/inventoryHelpers'
import {
  canAddWarehouseCapacity,
  createWarehouseCapacityRecord,
  emptyWarehouseCapacityForm,
  getTotalWarehouseCapacity,
  MAX_SELECTED_WAREHOUSES,
  parseStoredWarehouseCapacity,
  serializeWarehouseCapacity,
  toWarehouseCapacity,
  toggleSelectedWarehouseId,
  WAREHOUSE_CAPACITY_STORAGE_KEY,
} from '@/app/utils/helpers/warehouseCapacityHelpers'
import type {
  StoredWarehouseCapacityState,
  WarehouseCapacityFormState,
  WarehouseCapacityRecord,
  WarehouseCapacitySectionProps,
} from '@/app/types/warehouseCapacity'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function createInitialWarehouseState(
  initialCapacity: WarehouseCapacitySectionProps['initialCapacity']
): StoredWarehouseCapacityState {
  const initialWarehouse: WarehouseCapacityRecord = {
    id: 'warehouse-initial',
    warehouseName: initialCapacity.warehouse,
    address: 'Primary warehouse',
    maximumCapacity: initialCapacity.total,
    usedCapacity: initialCapacity.used,
  }

  return {
    warehouses: [initialWarehouse],
    selectedWarehouseIds: [initialWarehouse.id],
  }
}

export default function WarehouseCapacitySection({
  initialCapacity,
}: WarehouseCapacitySectionProps) {
  const [capacityState, setCapacityState] = useState<StoredWarehouseCapacityState>(
    () => {
      const initialState = createInitialWarehouseState(initialCapacity)

      if (typeof window === 'undefined') {
        return initialState
      }

      return parseStoredWarehouseCapacity(
        window.localStorage.getItem(WAREHOUSE_CAPACITY_STORAGE_KEY),
        initialState
      )
    }
  )
  const [form, setForm] = useState<WarehouseCapacityFormState>(
    emptyWarehouseCapacityForm
  )
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [warehouseSearch, setWarehouseSearch] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(
      WAREHOUSE_CAPACITY_STORAGE_KEY,
      serializeWarehouseCapacity(capacityState)
    )
  }, [capacityState])

  const { selectedWarehouseIds, warehouses } = capacityState

  const selectedWarehouses = warehouses.filter((warehouse) =>
    selectedWarehouseIds.includes(warehouse.id)
  )
  const filteredWarehouses = warehouses.filter((warehouse) => {
    const searchValue = warehouseSearch.toLowerCase()

    return (
      warehouseSearch === '' ||
      warehouse.warehouseName.toLowerCase().includes(searchValue) ||
      warehouse.address.toLowerCase().includes(searchValue)
    )
  })
  const totalCapacity = getTotalWarehouseCapacity(warehouses)
  const formCanSubmit = canAddWarehouseCapacity(form)

  function updateFormField(
    field: keyof WarehouseCapacityFormState,
    value: string
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  function handleAddWarehouse() {
    if (!formCanSubmit) return

    const newWarehouse = createWarehouseCapacityRecord(form)

    setCapacityState((currentState) => ({
      warehouses: [
        ...currentState.warehouses,
        newWarehouse,
      ],
      selectedWarehouseIds:
        currentState.selectedWarehouseIds.length < MAX_SELECTED_WAREHOUSES
          ? [...currentState.selectedWarehouseIds, newWarehouse.id]
          : currentState.selectedWarehouseIds,
    }))
    setForm(emptyWarehouseCapacityForm)
    setIsAddModalOpen(false)
  }

  return (
    <section id="WarehouseCapacity" className="grid scroll-mt-6 gap-5">
      <article className="flex min-h-85 flex-col rounded-2xl border border-[#DCE4DE] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#E7ECE8] pb-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-[#EBF3ED] p-2 text-[#0c0d0d]">
              <Warehouse className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold text-[#0c0d0d]">Warehouse capacity</h2>
              <p className="text-sm text-[#68716C]">
                {formatNumber(warehouses.length)} warehouses tracked
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:flex-row">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    className="rounded-xl cursor-pointer border-[#DFE2E0] px-3 py-2 text-sm"
                    type="button"
                    variant="outline"
                  />
                }
              >
                <CheckSquare className="h-4 w-4" />
                Select charts
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    {selectedWarehouseIds.length} of {MAX_SELECTED_WAREHOUSES} charts selected
                  </DropdownMenuLabel>
                  <div className="px-1.5 pb-2">
                    <input
                      className="h-9 w-full rounded-lg border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                      onChange={(event) => setWarehouseSearch(event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                      onPointerDown={(event) => event.stopPropagation()}
                      placeholder="Search warehouses"
                      value={warehouseSearch}
                    />
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {filteredWarehouses.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-[#737A76]">
                        No warehouses found.
                      </div>
                    ) : (
                      filteredWarehouses.map((warehouse) => {
                        const checked = selectedWarehouseIds.includes(warehouse.id)
                        const disabled =
                          !checked &&
                          selectedWarehouseIds.length >= MAX_SELECTED_WAREHOUSES

                        return (
                          <DropdownMenuItem
                            key={warehouse.id}
                            closeOnClick={false}
                            disabled={disabled}
                            onClick={() => {
                              if (disabled) return

                              setCapacityState((currentState) => ({
                                ...currentState,
                                selectedWarehouseIds: toggleSelectedWarehouseId(
                                  currentState.selectedWarehouseIds,
                                  warehouse.id
                                ),
                              }))
                            }}
                            className="cursor-pointer items-start gap-2 px-2 py-2"
                          >
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[#C9D1CB]">
                              {checked && <Check className="h-3 w-3" />}
                            </span>
                            <span className="flex min-w-0 flex-col">
                              <span className="truncate">{warehouse.warehouseName}</span>
                              <span className="truncate text-xs text-[#737A76]">
                                {warehouse.address}
                              </span>
                            </span>
                          </DropdownMenuItem>
                        )
                      })
                    )}
                  </div>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              className="rounded-xl cursor-pointer px-3 py-2 text-sm"
              onClick={() => setIsAddModalOpen(true)}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Add warehouse
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-4">
          <div className="rounded-xl border border-[#E2E2E2] bg-[#FAFBFA] p-4">
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-[#0c0d0d]">Total capacity</h3>
              <p className="text-xs text-[#68716C]">All added warehouses</p>
            </div>
            <WarehouseCapacityChart capacity={totalCapacity} />
          </div>

          <div className="grid gap-4 xl:col-span-3 xl:grid-cols-3">
            {selectedWarehouses.length === 0 ? (
              <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-[#DCE4DE] bg-[#FAFBFA] text-sm text-[#737A76] xl:col-span-3">
                Select warehouse charts from the dropdown.
              </div>
            ) : (
              selectedWarehouses.map((warehouse) => (
                <div
                  className="rounded-xl border border-[#E2E2E2] bg-white p-4"
                  key={warehouse.id}
                >
                  <div className="flex flex-col">
                    <h3 className="truncate text-sm font-semibold text-[#0c0d0d]">
                      {warehouse.warehouseName}
                    </h3>
                    <p className="truncate text-xs text-[#68716C]">
                      {warehouse.address}
                    </p>
                  </div>
                  <WarehouseCapacityChart
                    capacity={toWarehouseCapacity(warehouse)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <AppModal
          className="flex max-h-[90vh] flex-col"
          onClose={() => setIsAddModalOpen(false)}
          open={isAddModalOpen}
        >
          <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
            <div className="flex flex-col">
              <span className="text-xs text-[#737A76]">Warehouse capacity</span>
              <span className="text-xl font-medium text-[#0c0d0d]">Add warehouse</span>
            </div>
            <CloseButton onClick={() => setIsAddModalOpen(false)} />
          </div>

          <div className="flex flex-col gap-4 p-4">
            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Warehouse name</span>
              <input
                className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                onChange={(event) =>
                  updateFormField('warehouseName', event.target.value)
                }
                value={form.warehouseName}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Address</span>
              <input
                className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                onChange={(event) =>
                  updateFormField('address', event.target.value)
                }
                value={form.address}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Maximum capacity</span>
              <input
                className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                min={1}
                onChange={(event) =>
                  updateFormField('maximumCapacity', event.target.value)
                }
                type="number"
                value={form.maximumCapacity}
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
            <Button
              className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
              onClick={() => setIsAddModalOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl px-3 py-2 text-sm"
              disabled={!formCanSubmit}
              onClick={handleAddWarehouse}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Add warehouse
            </Button>
          </div>
        </AppModal>
      </article>
    </section>
  )
}
