'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, CheckSquare, Plus, Warehouse } from 'lucide-react'
import { toast } from 'sonner'

import CloseButton from '@/app/components/CloseButton'
import AppModal from '@/app/components/modals/AppModal'
import StatusAction from '@/app/components/StatusAction'
import WarehouseCapacityChart from '@/app/components/inventory/WarehouseCapacityChart'
import Loading from '@/app/components/loaders/Loading'
import { formatNumber } from '@/app/utils/helpers/inventoryHelpers'
import {
  canAddWarehouseCapacity,
  emptyWarehouseCapacityForm,
  getTotalWarehouseCapacity,
  MAX_SELECTED_WAREHOUSES,
  toWarehouseCapacity,
  toggleSelectedWarehouseId,
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
import {
  deleteWarehouse,
  fetchWarehouses,
  insertWarehouse,
  updateWarehouse,
} from '@/app/utils/api/warehouseApi'
import type { WarehouseListItem } from '@/app/types/warehouseCapacity'
import type { InsertWarehousePayload } from '@/app/utils/types/warehouseCapacity'
import { editDeleteActions } from '@/app/utils/helpers/statusActionHelpers'
import { queryKeys } from '@/app/utils/api/queryKeys'
import { invalidateInventories, invalidateWarehouses } from '@/app/utils/api/queryInvalidation'

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

function toWarehouseCapacityRecord(warehouse: WarehouseListItem): WarehouseCapacityRecord {
  return {
    id: String(warehouse.id),
    warehouseName: warehouse.name,
    address: warehouse.address,
    maximumCapacity: warehouse.capacity,
    usedCapacity: warehouse.stocks,
  }
}

function isAllWarehouseRecord(warehouse: WarehouseCapacityRecord) {
  return warehouse.warehouseName.toLowerCase() === 'all warehouse record'
}

export default function WarehouseCapacitySection({
  initialCapacity,
}: WarehouseCapacitySectionProps) {
  const [capacityState, setCapacityState] = useState<StoredWarehouseCapacityState>(
    () => createInitialWarehouseState(initialCapacity)
  )
  const [form, setForm] = useState<WarehouseCapacityFormState>(
    emptyWarehouseCapacityForm
  )
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseCapacityRecord | null>(null)
  const [warehouseSearch, setWarehouseSearch] = useState('')
  const queryClient = useQueryClient()
  const {
    isLoading: isLoadingWarehouses,
  } = useQuery({
    queryKey: queryKeys.warehouses.all,
    queryFn: () => fetchWarehouses(),
    onSuccess: syncCapacityState,
  })

  function syncCapacityState(warehouseItems: WarehouseListItem[]) {
    const warehouses = warehouseItems.map(toWarehouseCapacityRecord)
    const chartWarehouses = warehouses.filter((warehouse) => !isAllWarehouseRecord(warehouse))

    setCapacityState((currentState) => {
      const selectedWarehouseIds = currentState.selectedWarehouseIds
        .filter((id) => chartWarehouses.some((warehouse) => warehouse.id === id))
        .slice(0, MAX_SELECTED_WAREHOUSES)

      return {
        warehouses,
        selectedWarehouseIds:
          selectedWarehouseIds.length > 0
            ? selectedWarehouseIds
            : chartWarehouses.slice(0, MAX_SELECTED_WAREHOUSES).map((warehouse) => warehouse.id),
      }
    })
  }

  const { selectedWarehouseIds, warehouses } = capacityState
  const allWarehouseRecord = warehouses.find(isAllWarehouseRecord)
  const chartWarehouses = warehouses.filter((warehouse) => !isAllWarehouseRecord(warehouse))

  const selectedWarehouses = chartWarehouses.filter((warehouse) =>
    selectedWarehouseIds.includes(warehouse.id)
  )
  const filteredWarehouses = chartWarehouses.filter((warehouse) => {
    const searchValue = warehouseSearch.toLowerCase()

    return (
      warehouseSearch === '' ||
      warehouse.warehouseName.toLowerCase().includes(searchValue) ||
      warehouse.address.toLowerCase().includes(searchValue)
    )
  })
  const totalCapacity = allWarehouseRecord
    ? toWarehouseCapacity(allWarehouseRecord)
    : getTotalWarehouseCapacity(chartWarehouses)
  const formCanSubmit = canAddWarehouseCapacity(form)
  const addWarehouseMutation = useMutation({
    mutationFn: (payload: InsertWarehousePayload & { optimisticId: string }) =>
      insertWarehouse({
        name: payload.name,
        address: payload.address,
        capicity: payload.capicity,
      }),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.warehouses.all })
      const previousState = capacityState
      const newWarehouse: WarehouseCapacityRecord = {
        id: payload.optimisticId,
        warehouseName: payload.name,
        address: payload.address,
        maximumCapacity: payload.capicity,
        usedCapacity: 0,
      }

      setCapacityState((currentState) => ({
        warehouses: [newWarehouse, ...currentState.warehouses],
        selectedWarehouseIds:
          currentState.selectedWarehouseIds.length < MAX_SELECTED_WAREHOUSES
            ? [newWarehouse.id, ...currentState.selectedWarehouseIds]
            : currentState.selectedWarehouseIds,
      }))

      return { previousState }
    },
    onError: (err, _payload, context) => {
      if (context?.previousState) setCapacityState(context.previousState)
      toast.error(err instanceof Error ? err.message : 'Failed to add warehouse.')
    },
    onSuccess: () => {
      resetForm()
      toast.success('Warehouse added successfully.')
    },
    onSettled: () => {
      invalidateWarehouses(queryClient)
      invalidateInventories(queryClient)
    },
  })
  const updateWarehouseMutation = useMutation({
    mutationFn: updateWarehouse,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.warehouses.all })
      const previousState = capacityState

      setCapacityState((currentState) => ({
        ...currentState,
        warehouses: currentState.warehouses.map((warehouse) =>
          warehouse.id === String(payload.id)
            ? {
                ...warehouse,
                warehouseName: payload.name,
                address: payload.address,
                maximumCapacity: payload.capicity,
              }
            : warehouse
        ),
      }))

      return { previousState }
    },
    onError: (err, _payload, context) => {
      if (context?.previousState) setCapacityState(context.previousState)
      toast.error(err instanceof Error ? err.message : 'Failed to update warehouse.')
    },
    onSuccess: () => toast.success('Warehouse updated successfully.'),
    onSettled: () => {
      invalidateWarehouses(queryClient)
      invalidateInventories(queryClient)
    },
  })
  const deleteWarehouseMutation = useMutation({
    mutationFn: deleteWarehouse,
    onMutate: async (warehouseId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.warehouses.all })
      const previousState = capacityState
      const selectedWarehouseId = String(warehouseId)

      setCapacityState((currentState) => ({
        warehouses: currentState.warehouses.filter((warehouse) => warehouse.id !== selectedWarehouseId),
        selectedWarehouseIds: currentState.selectedWarehouseIds.filter((id) => id !== selectedWarehouseId),
      }))

      return { previousState }
    },
    onError: (err, _warehouseId, context) => {
      if (context?.previousState) setCapacityState(context.previousState)
      toast.error(err instanceof Error ? err.message : 'Failed to delete warehouse.')
    },
    onSuccess: () => toast.success('Warehouse deleted successfully.'),
    onSettled: () => {
      invalidateWarehouses(queryClient)
      invalidateInventories(queryClient)
    },
  })
  const isSubmitting =
    addWarehouseMutation.isLoading ||
    updateWarehouseMutation.isLoading ||
    deleteWarehouseMutation.isLoading

  function updateFormField(
    field: keyof WarehouseCapacityFormState,
    value: string
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  function resetForm() {
    setForm(emptyWarehouseCapacityForm)
    setSelectedWarehouse(null)
  }

  async function handleAddWarehouse() {
    if (!formCanSubmit) return

    const payload = {
      name: form.warehouseName.trim(),
      address: form.address.trim(),
      capicity: Number(form.maximumCapacity),
    }

    setIsAddModalOpen(false)

    addWarehouseMutation.mutate({ ...payload, optimisticId: String(-Date.now()) })
  }

  async function handleUpdateWarehouse() {
    if (!selectedWarehouse || !formCanSubmit) return

    const warehouseId = Number(selectedWarehouse.id)
    if (!Number.isFinite(warehouseId)) return

    const payload = {
      id: warehouseId,
      name: form.warehouseName.trim(),
      address: form.address.trim(),
      capicity: Number(form.maximumCapacity),
    }

    setIsEditModalOpen(false)
    resetForm()

    updateWarehouseMutation.mutate(payload)
  }

  async function handleDeleteWarehouse() {
    if (!selectedWarehouse) return

    const warehouseId = Number(selectedWarehouse.id)
    if (!Number.isFinite(warehouseId)) return

    setIsDeleteModalOpen(false)
    resetForm()

    deleteWarehouseMutation.mutate(warehouseId)
  }

  function openEditModal(warehouse: WarehouseCapacityRecord) {
    setSelectedWarehouse(warehouse)
    setForm({
      warehouseName: warehouse.warehouseName,
      address: warehouse.address,
      maximumCapacity: String(warehouse.maximumCapacity),
    })
    setIsEditModalOpen(true)
  }

  function openDeleteModal(warehouse: WarehouseCapacityRecord) {
    setSelectedWarehouse(warehouse)
    setIsDeleteModalOpen(true)
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
                {formatNumber(chartWarehouses.length)} warehouses tracked
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
                              <span className="truncate capitalize">{warehouse.warehouseName}</span>
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
            {isLoadingWarehouses ? (
              <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-[#DCE4DE] bg-[#FAFBFA] text-sm text-[#737A76] xl:col-span-3">
                <Loading />
              </div>
            ) : selectedWarehouses.length === 0 ? (
              <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-[#DCE4DE] bg-[#FAFBFA] text-sm text-[#737A76] xl:col-span-3">
                Select warehouse charts from the dropdown.
              </div>
            ) : (
              selectedWarehouses.map((warehouse) => (
                <div
                  className="rounded-xl border border-[#E2E2E2] bg-white p-4"
                  key={warehouse.id}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-col">
                      <h3 className="truncate text-sm font-semibold text-[#0c0d0d] capitalize">
                        {warehouse.warehouseName}
                      </h3>
                      <p className="truncate text-xs text-[#68716C]">
                        {warehouse.address}
                      </p>
                    </div>
                    <StatusAction
                      actions={editDeleteActions}
                      label={`More actions for warehouse ${warehouse.warehouseName}`}
                      onAction={(action) => {
                        if (action === 'edit') openEditModal(warehouse)
                        if (action === 'delete') openDeleteModal(warehouse)
                      }}
                    />
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
          onClose={() => {
            setIsAddModalOpen(false)
            resetForm()
          }}
          open={isAddModalOpen}
        >
          <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
            <div className="flex flex-col">
              <span className="text-xs text-[#737A76]">Warehouse capacity</span>
              <span className="text-xl font-medium text-[#0c0d0d]">Add warehouse</span>
            </div>
            <CloseButton
              onClick={() => {
                setIsAddModalOpen(false)
                resetForm()
              }}
            />
          </div>

          <div className="flex flex-col gap-4 p-4">
            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Warehouse name</span>
              <input
                className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514] capitalize"
                onChange={(event) =>
                  updateFormField('warehouseName', event.target.value)
                }
                value={form.warehouseName}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Address</span>
              <input
                className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514] capitalize"
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
              onClick={() => {
                setIsAddModalOpen(false)
                resetForm()
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl px-3 py-2 text-sm"
              disabled={!formCanSubmit || isSubmitting}
              onClick={handleAddWarehouse}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Add warehouse
            </Button>
          </div>
        </AppModal>

        <AppModal
          className="flex max-h-[90vh] flex-col"
          onClose={() => {
            setIsEditModalOpen(false)
            resetForm()
          }}
          open={isEditModalOpen}
        >
          <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
            <div className="flex flex-col">
              <span className="text-xs text-[#737A76]">Warehouse capacity</span>
              <span className="text-xl font-medium text-[#0c0d0d]">Edit warehouse</span>
            </div>
            <CloseButton
              onClick={() => {
                setIsEditModalOpen(false)
                resetForm()
              }}
            />
          </div>

          <div className="flex flex-col gap-4 p-4">
            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Warehouse name</span>
              <input
                className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514] capitalize"
                onChange={(event) =>
                  updateFormField('warehouseName', event.target.value)
                }
                value={form.warehouseName}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Address</span>
              <input
                className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514] capitalize"
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
              onClick={() => {
                setIsEditModalOpen(false)
                resetForm()
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl px-3 py-2 text-sm"
              disabled={!formCanSubmit || isSubmitting}
              onClick={handleUpdateWarehouse}
              type="button"
            >
              Save changes
            </Button>
          </div>
        </AppModal>

        <AppModal
          className="flex max-h-[90vh] flex-col"
          onClose={() => {
            setIsDeleteModalOpen(false)
            resetForm()
          }}
          open={isDeleteModalOpen}
        >
          <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
            <div className="flex flex-col">
              <span className="text-xs text-[#737A76]">Warehouse capacity</span>
              <span className="text-xl font-medium text-[#0c0d0d]">Delete warehouse</span>
            </div>
            <CloseButton
              onClick={() => {
                setIsDeleteModalOpen(false)
                resetForm()
              }}
            />
          </div>

          <div className="flex flex-col gap-2 p-4">
            <span className="text-sm text-[#121514]">
              Are you sure you want to delete this warehouse?
            </span>
            <span className="text-sm font-medium text-[#0c0d0d] capitalize">
              {selectedWarehouse?.warehouseName}
            </span>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
            <Button
              className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
              onClick={() => {
                setIsDeleteModalOpen(false)
                resetForm()
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl px-3 py-2 text-sm"
              disabled={isSubmitting || !selectedWarehouse}
              onClick={handleDeleteWarehouse}
              type="button"
              variant="destructive"
            >
              Delete warehouse
            </Button>
          </div>
        </AppModal>
      </article>
    </section>
  )
}
