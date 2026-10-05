"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteWarehouse, fetchWarehouses, insertWarehouse, updateWarehouse } from "@/services/warehouseApi"
import { optimisticUpdate } from "@/lib/query/optimisticUpdate"
import { invalidateInventories, invalidateWarehouses } from "@/lib/query/queryInvalidation"
import { queryKeys } from "@/lib/query/queryKeys"
import type {
  FetchWarehousesParams,
  InsertWarehousePayload,
  UpdateWarehousePayload,
  WarehouseListItem,
} from "@/types/warehouse"

type WarehousesResponse = Awaited<ReturnType<typeof fetchWarehouses>>

export interface WarehousesQuery {
  page: number
  pageSize: number
  search: string
  /** Sort code, see getWarehouseFilter. */
  sort: number
}

function warehousesParams({ page, pageSize, search, sort }: WarehousesQuery): FetchWarehousesParams {
  return { page, pageSize, name: search || undefined, filter: sort }
}

export function useWarehouses(query: WarehousesQuery) {
  const params = warehousesParams(query)
  return useQuery({
    queryKey: queryKeys.warehouses.all(params),
    queryFn: () => fetchWarehouses(params),
    placeholderData: keepPreviousData,
  })
}

// Add/edit/delete for the warehouses page. Each one updates the visible page in the cache straight away.
export function useWarehouseMutations(query: WarehousesQuery) {
  const queryClient = useQueryClient()
  const shared = {
    queryClient,
    queryKey: queryKeys.warehouses.all(warehousesParams(query)),
    scopeKey: ["warehouses"],
  }
  // Warehouse changes also affect the inventory list (warehouse names).
  const refetchAll = () => {
    invalidateWarehouses(queryClient)
    invalidateInventories(queryClient)
  }

  const addWarehouse = useMutation({
    mutationFn: ({ name, address }: InsertWarehousePayload & { optimisticId: number }) =>
      insertWarehouse({ name, address }),
    ...optimisticUpdate<WarehousesResponse, InsertWarehousePayload & { optimisticId: number }>({
      ...shared,
      update: (current, { name, address, optimisticId }) => {
        const tempWarehouse: WarehouseListItem = {
          id: optimisticId,
          name,
          address,
          stocks: 0,
          created_At: new Date().toISOString(),
        }
        return {
          ...current,
          items: [tempWarehouse, ...current.items].slice(0, query.pageSize),
          rows: current.rows + 1,
        }
      },
      successMessage: "Warehouse added successfully",
      errorMessage: "Failed to add warehouse",
    }),
    onSettled: refetchAll,
  })

  const updateWarehouseMutation = useMutation({
    mutationFn: updateWarehouse,
    ...optimisticUpdate<WarehousesResponse, UpdateWarehousePayload>({
      ...shared,
      update: (current, { id, name, address }) => ({
        ...current,
        items: current.items.map((warehouse) => (warehouse.id === id ? { ...warehouse, name, address } : warehouse)),
      }),
      successMessage: "Warehouse updated successfully",
      errorMessage: "Failed to update warehouse",
    }),
    onSettled: refetchAll,
  })

  const deleteWarehouseMutation = useMutation({
    mutationFn: deleteWarehouse,
    ...optimisticUpdate<WarehousesResponse, number>({
      ...shared,
      update: (current, warehouseId) => ({
        ...current,
        items: current.items.filter((warehouse) => warehouse.id !== warehouseId),
        rows: Math.max(0, current.rows - 1),
      }),
      successMessage: "Warehouse deleted successfully",
      errorMessage: "Failed to delete warehouse",
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
