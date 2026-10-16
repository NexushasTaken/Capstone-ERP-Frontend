"use client"

import { keepPreviousData, type QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
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
} from "@/services/inventoryApi"
import { fetchCategories } from "@/services/categoryApi"
import { optimisticUpdate } from "@/lib/query/optimisticUpdate"
import { invalidateInventories } from "@/lib/query/queryInvalidation"
import { queryKeys } from "@/lib/query/queryKeys"
import type {
  FetchInventoriesParams,
  InsertInventoryPayload,
  InventoryListItem,
  MarkInventoryAsDamagePayload,
  UpdateInventoryPayload,
} from "@/types/inventory"

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

const ALL_CATEGORIES = { page: 1, pageSize: 1000 }

/** Categories the list can be filtered by. Shares its cache entry with the product form. */
export function useSelectableCategories() {
  const query = useQuery({
    queryKey: queryKeys.categories.all(ALL_CATEGORIES),
    queryFn: () => fetchCategories(ALL_CATEGORIES),
  })
  return query.data?.items ?? []
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

// The optimistic row needs the product name, which the API payload doesn't carry.
type WithName<T> = T & { productName: string }

export function useInventoryMutations(listQueryKey: QueryKey) {
  const queryClient = useQueryClient()
  const shared = {
    queryClient,
    queryKey: listQueryKey,
    scopeKey: ["inventories"],
  }

  const addInventory = useMutation({
    mutationFn: ({ quantity, productId, reorderPoint }: WithName<InsertInventoryPayload> & { optimisticId: number }) =>
      insertInventory({ quantity, productId, reorderPoint }),
    ...optimisticUpdate<InventoriesResponse, WithName<InsertInventoryPayload> & { optimisticId: number }>({
      ...shared,
      update: (current, payload) => {
        const optimisticItem: InventoryListItem = {
          id: payload.optimisticId,
          productId: payload.productId,
          name: payload.productName,
          quantity: payload.quantity,
          reorderPoint: payload.reorderPoint,
          status: "pending",
          categoryName: "Pending...",
        }
        return {
          ...current,
          items: [optimisticItem, ...current.items],
          rows: current.rows + 1,
        }
      },
      successMessage: "Inventory item added successfully.",
      errorMessage: "Failed to add inventory item.",
    }),
  })

  const updateInventoryMutation = useMutation({
    mutationFn: ({ id, reorderPoint }: UpdateInventoryPayload) => updateInventory({ id, reorderPoint }),
    ...optimisticUpdate<InventoriesResponse, UpdateInventoryPayload>({
      ...shared,
      update: (current, payload) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === payload.id ? { ...item, reorderPoint: payload.reorderPoint } : item,
        ),
      }),
      successMessage: "Inventory item updated successfully.",
      errorMessage: "Failed to update inventory item.",
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
      successMessage: "Inventory item deleted successfully.",
      errorMessage: "Failed to delete inventory item.",
    }),
  })

  // Damage lowers the quantity right away, and an already-loaded
  // damage history gets the new report on top. Both roll back if the request fails.
  const markAsDamage = useMutation({
    mutationFn: markInventoryAsDamage,
    onMutate: async (payload: MarkInventoryAsDamagePayload) => {
      await queryClient.cancelQueries({ queryKey: ["inventories"] })
      const previousQuantity = queryClient
        .getQueryData<InventoriesResponse>(listQueryKey)
        ?.items.find((item) => item.id === payload.id)?.quantity
      const damageKey = queryKeys.inventories.damageRecords(payload.id)
      const previousDamageRecords = queryClient.getQueryData<DamageRecords>(damageKey)

      queryClient.setQueryData<InventoriesResponse>(
        listQueryKey,
        (current) =>
          current && {
            ...current,
            items: current.items.map((item) =>
              item.id === payload.id ? { ...item, quantity: item.quantity - payload.quantity } : item,
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
      toast.error(error instanceof Error ? error.message : "Failed to mark inventory as damaged.")
    },
    onSuccess: () => {
      toast.success("Inventory marked as damaged successfully.")
    },
    onSettled: () => invalidateInventories(queryClient),
  })

  const restock = useMutation({
    mutationFn: restockInventory,
    onSuccess: () => {
      toast.success("Inventory restocked successfully.")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to restock inventory.")
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
