'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteWarehouse, fetchWarehouses, insertWarehouse, updateWarehouse } from '@/services/warehouseApi'
import { optimisticUpdate } from '@/lib/query/optimisticUpdate'
import { invalidateInventories, invalidateWarehouses } from '@/lib/query/queryInvalidation'
import { queryKeys } from '@/lib/query/queryKeys'
import type { InsertWarehousePayload, UpdateWarehousePayload, WarehouseListItem } from '@/types/warehouseCapacity'

export function useWarehouses() {
  return useQuery({
    queryKey: queryKeys.warehouses.all,
    queryFn: () => fetchWarehouses(),
  })
}

export function useWarehouseMutations() {
  const queryClient = useQueryClient()
  const shared = { queryClient, queryKey: queryKeys.warehouses.all, scopeKey: queryKeys.warehouses.all }
  // Warehouse changes also affect the inventory list (warehouse names, stock).
  const refetchAll = () => {
    invalidateWarehouses(queryClient)
    invalidateInventories(queryClient)
  }

  const addWarehouse = useMutation({
    mutationFn: ({ name, address, capicity }: InsertWarehousePayload & { optimisticId: number }) =>
      insertWarehouse({ name, address, capicity }),
    ...optimisticUpdate<WarehouseListItem[], InsertWarehousePayload & { optimisticId: number }>({
      ...shared,
      update: (current, payload) => [
        { id: payload.optimisticId, name: payload.name, address: payload.address, capacity: payload.capicity, stocks: 0 },
        ...current,
      ],
      successMessage: 'Warehouse added successfully.',
      errorMessage: 'Failed to add warehouse.',
    }),
    onSettled: refetchAll,
  })

  const updateWarehouseMutation = useMutation({
    mutationFn: updateWarehouse,
    ...optimisticUpdate<WarehouseListItem[], UpdateWarehousePayload>({
      ...shared,
      update: (current, payload) => current.map((warehouse) =>
        warehouse.id === payload.id
          ? { ...warehouse, name: payload.name, address: payload.address, capacity: payload.capicity }
          : warehouse
      ),
      successMessage: 'Warehouse updated successfully.',
      errorMessage: 'Failed to update warehouse.',
    }),
    onSettled: refetchAll,
  })

  const deleteWarehouseMutation = useMutation({
    mutationFn: deleteWarehouse,
    ...optimisticUpdate<WarehouseListItem[], number>({
      ...shared,
      update: (current, warehouseId) => current.filter((warehouse) => warehouse.id !== warehouseId),
      successMessage: 'Warehouse deleted successfully.',
      errorMessage: 'Failed to delete warehouse.',
    }),
    onSettled: refetchAll,
  })

  return {
    addWarehouse,
    updateWarehouse: updateWarehouseMutation,
    deleteWarehouse: deleteWarehouseMutation,
    isSubmitting: addWarehouse.isPending || updateWarehouseMutation.isPending || deleteWarehouseMutation.isPending,
  }
}
