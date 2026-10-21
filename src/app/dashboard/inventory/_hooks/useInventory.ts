"use client"

import { keepPreviousData, type QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  adjustInventory,
  deleteInventory,
  fetchInventories,
  fetchInventoryAdjustments,
  fetchInventoryMovements,
  fetchInventoryStatusCounts,
  insertInventory,
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
  UpdateInventoryPayload,
} from "@/types/inventory"

type InventoriesResponse = Awaited<ReturnType<typeof fetchInventories>>

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

/** Stock movements and adjustments for one item, loaded only while its details are open. */
export function useInventoryHistory(inventoryId: number | null, enabled: boolean) {
  const shouldLoad = enabled && inventoryId !== null && inventoryId > 0
  const movements = useQuery({
    queryKey: queryKeys.inventories.movements(inventoryId),
    queryFn: () => fetchInventoryMovements(inventoryId!),
    enabled: shouldLoad,
  })
  const adjustments = useQuery({
    queryKey: queryKeys.inventories.adjustments(inventoryId),
    queryFn: () => fetchInventoryAdjustments(inventoryId!),
    enabled: shouldLoad,
  })
  return { movements, adjustments, shouldLoad }
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

  // Not optimistic: a count correction's change is only known from the current stock, so wait for the server.
  const adjust = useMutation({
    mutationFn: adjustInventory,
    onSuccess: () => {
      toast.success("Stock adjusted successfully.")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to adjust stock.")
    },
    onSettled: () => invalidateInventories(queryClient),
  })

  return {
    addInventory,
    updateInventory: updateInventoryMutation,
    deleteInventory: deleteInventoryMutation,
    adjust,
    isSubmitting:
      addInventory.isPending ||
      updateInventoryMutation.isPending ||
      deleteInventoryMutation.isPending ||
      adjust.isPending,
  }
}
