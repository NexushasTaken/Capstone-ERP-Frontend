'use client'

import { keepPreviousData, type QueryKey, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  deleteInventory,
  fetchInventories,
  fetchInventoryDamageRecords,
  fetchInventoryMovements,
  fetchInventoryStatusCounts,
  insertInventory,
  markInventoryAsDamage,
  restockInventory,
  updateInventory,
} from '@/services/inventoryApi'
import { fetchInventoryForecast } from '@/services/dashboardApi'
import { fetchWarehouses } from '@/services/warehouseApi'
import { isSelectableWarehouse } from '@/lib/helpers/inventoryHelpers'
import { optimisticUpdate } from '@/lib/query/optimisticUpdate'
import { invalidateInventories } from '@/lib/query/queryInvalidation'
import { queryKeys } from '@/lib/query/queryKeys'
import type {
  FetchInventoriesParams,
  InsertInventoryPayload,
  InventoryListItem,
  MarkInventoryAsDamagePayload,
  UpdateInventoryPayload,
} from '@/types/inventory'

type InventoriesResponse = Awaited<ReturnType<typeof fetchInventories>>
type DamageRecords = Awaited<ReturnType<typeof fetchInventoryDamageRecords>>

export function useInventories(params: FetchInventoriesParams) {
  return useQuery({
    queryKey: queryKeys.inventories.all(params),
    queryFn: () => fetchInventories(params),
    placeholderData: keepPreviousData,
  })
}

export function useInventoryStatusCounts() {
  return useQuery({
    queryKey: queryKeys.inventories.statusCounts,
    queryFn: ({ signal }) => fetchInventoryStatusCounts(signal),
  })
}

/** How many products are forecast to run out (only the row count is needed). */
export function useForecastRiskCount() {
  const params = { page: 1, pageSize: 1 }
  const { data } = useQuery({
    queryKey: queryKeys.dashboard.inventoryForecast(params),
    queryFn: ({ signal }) => fetchInventoryForecast(params, signal),
  })
  return data?.rows ?? 0
}

/** Warehouses an inventory item can be assigned to. */
export function useSelectableWarehouses(enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.warehouses.all,
    queryFn: () => fetchWarehouses(),
    enabled,
  })
  return {
    warehouses: (query.data ?? []).filter(isSelectableWarehouse),
    isLoading: query.isLoading,
  }
}

/** Stock movements and damage reports for one item, loaded only while its details are open. */
export function useInventoryHistory(inventoryId: number | null, enabled: boolean) {
  const shouldLoad = enabled && inventoryId !== null && inventoryId > 0
  const movements = useQuery({
    queryKey: queryKeys.inventories.movements(inventoryId),
    queryFn: () => fetchInventoryMovements(inventoryId!),
    enabled: shouldLoad,
  })
  const damageRecords = useQuery({
    queryKey: queryKeys.inventories.damageRecords(inventoryId),
    queryFn: () => fetchInventoryDamageRecords(inventoryId!),
    enabled: shouldLoad,
  })
  return { movements, damageRecords, shouldLoad }
}

// The optimistic updates need the warehouse name, which the API payload doesn't carry.
type WithWarehouseName<T> = T & { warehouseName: string | null }

export function useInventoryMutations(listQueryKey: QueryKey) {
  const queryClient = useQueryClient()
  const shared = {
    queryClient,
    queryKey: listQueryKey,
    scopeKey: ['inventories'],
  }

  const addInventory = useMutation({
    mutationFn: ({
      name,
      quantity,
      productId,
      warehouseId,
      dateArrived,
      reorderPoint,
    }: WithWarehouseName<InsertInventoryPayload> & { optimisticId: number }) =>
      insertInventory({
        name,
        quantity,
        productId,
        warehouseId,
        dateArrived,
        reorderPoint,
      }),
    ...optimisticUpdate<InventoriesResponse, WithWarehouseName<InsertInventoryPayload> & { optimisticId: number }>({
      ...shared,
      update: (current, payload) => {
        const optimisticItem: InventoryListItem = {
          id: payload.optimisticId,
          productId: payload.productId,
          name: payload.name,
          quantity: payload.quantity,
          reorderPoint: payload.reorderPoint,
          warehouseId: payload.warehouseId,
          warehouseName: payload.warehouseName ?? 'Pending...',
          status: 'pending',
          dateArrived: payload.dateArrived,
        }
        return {
          ...current,
          items: [optimisticItem, ...current.items],
          rows: current.rows + 1,
        }
      },
      successMessage: 'Inventory item added successfully.',
      errorMessage: 'Failed to add inventory item.',
    }),
  })

  const updateInventoryMutation = useMutation({
    mutationFn: ({ id, name, productId, warehouseId, reorderPoint }: WithWarehouseName<UpdateInventoryPayload>) =>
      updateInventory({ id, name, productId, warehouseId, reorderPoint }),
    ...optimisticUpdate<InventoriesResponse, WithWarehouseName<UpdateInventoryPayload>>({
      ...shared,
      update: (current, payload) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === payload.id
            ? {
                ...item,
                productId: payload.productId,
                name: payload.name,
                warehouseId: payload.warehouseId,
                warehouseName: payload.warehouseName ?? item.warehouseName,
                reorderPoint: payload.reorderPoint,
              }
            : item,
        ),
      }),
      successMessage: 'Inventory item updated successfully.',
      errorMessage: 'Failed to update inventory item.',
    }),
  })

  const deleteInventoryMutation = useMutation({
    mutationFn: deleteInventory,
    ...optimisticUpdate<InventoriesResponse, number>({
      ...shared,
      update: (current, inventoryId) => ({
        ...current,
        items: current.items.filter((item) => item.id !== inventoryId),
        rows: Math.max(current.rows - 1, 0),
      }),
      successMessage: 'Inventory item deleted successfully.',
      errorMessage: 'Failed to delete inventory item.',
    }),
  })

  // Damage of the current stock (type 1) lowers the quantity right away, and an already-loaded
  // damage history gets the new report on top. Both roll back if the request fails.
  const markAsDamage = useMutation({
    mutationFn: markInventoryAsDamage,
    onMutate: async (payload: MarkInventoryAsDamagePayload) => {
      await queryClient.cancelQueries({ queryKey: ['inventories'] })
      const previousQuantity =
        payload.damagedType === 1
          ? queryClient.getQueryData<InventoriesResponse>(listQueryKey)?.items.find((item) => item.id === payload.id)
              ?.quantity
          : undefined
      const damageKey = queryKeys.inventories.damageRecords(payload.id)
      const previousDamageRecords = queryClient.getQueryData<DamageRecords>(damageKey)

      queryClient.setQueryData<InventoriesResponse>(
        listQueryKey,
        (current) =>
          current && {
            ...current,
            items: current.items.map((item) =>
              item.id === payload.id && payload.damagedType === 1
                ? { ...item, quantity: item.quantity - payload.quantity }
                : item,
            ),
          },
      )
      // Only extend loaded history so an incomplete history is never cached as complete.
      if (previousDamageRecords) {
        queryClient.setQueryData(damageKey, [
          {
            quantity: payload.quantity,
            reason: payload.reason,
            created_At: payload.created_At,
          },
          ...previousDamageRecords,
        ])
      }
      return { previousQuantity, previousDamageRecords, damageKey }
    },
    onError: (error, payload, context) => {
      if (context?.previousQuantity !== undefined) {
        const quantity = context.previousQuantity
        queryClient.setQueryData<InventoriesResponse>(
          listQueryKey,
          (current) =>
            current && {
              ...current,
              items: current.items.map((item) => (item.id === payload.id ? { ...item, quantity } : item)),
            },
        )
      }
      if (context?.previousDamageRecords) {
        queryClient.setQueryData(context.damageKey, context.previousDamageRecords)
      }
      toast.error(error instanceof Error ? error.message : 'Failed to mark inventory as damaged.')
    },
    onSuccess: () => {
      toast.success('Inventory marked as damaged successfully.')
    },
    onSettled: () => invalidateInventories(queryClient),
  })

  const restock = useMutation({
    mutationFn: restockInventory,
    onSuccess: () => {
      toast.success('Inventory restocked successfully.')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to restock inventory.')
    },
    onSettled: () => invalidateInventories(queryClient),
  })

  return {
    addInventory,
    updateInventory: updateInventoryMutation,
    deleteInventory: deleteInventoryMutation,
    markAsDamage,
    restock,
    isSubmitting:
      addInventory.isPending ||
      updateInventoryMutation.isPending ||
      deleteInventoryMutation.isPending ||
      markAsDamage.isPending ||
      restock.isPending,
  }
}
