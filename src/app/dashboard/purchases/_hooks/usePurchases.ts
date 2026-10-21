"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  cancelPurchase,
  fetchPurchases,
  fetchPurchaseStatusCounts,
  insertPurchase,
  receivePurchase,
  updatePurchase,
} from "@/services/purchaseApi"
import { invalidateInventories } from "@/lib/query/queryInvalidation"
import { queryKeys } from "@/lib/query/queryKeys"
import type { FetchPurchasesParams } from "@/types/purchase"

export function usePurchases(params: FetchPurchasesParams) {
  return useQuery({
    queryKey: queryKeys.purchases.all(params),
    queryFn: () => fetchPurchases(params),
    placeholderData: keepPreviousData,
  })
}

export function usePurchaseStatusCounts() {
  return useQuery({
    queryKey: queryKeys.purchases.statusCounts,
    queryFn: ({ signal }) => fetchPurchaseStatusCounts(signal),
  })
}

// Not optimistic: the modals stay open until the server answers, so its row errors can show under the fields.
// Callers handle errors (applyServerErrors, else a toast).
export function usePurchaseMutations() {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["purchases"] })

  const addPurchase = useMutation({
    mutationFn: insertPurchase,
    onSuccess: () => toast.success("Purchase added successfully"),
    onSettled: refresh,
  })

  const updatePurchaseMutation = useMutation({
    mutationFn: updatePurchase,
    onSuccess: () => toast.success("Purchase updated successfully"),
    onSettled: refresh,
  })

  const cancelPurchaseMutation = useMutation({
    mutationFn: cancelPurchase,
    onSuccess: () => toast.success("Purchase cancelled"),
    onSettled: refresh,
  })

  // Receiving adds stock (and may add stock records), so Inventory refreshes too.
  const receivePurchaseMutation = useMutation({
    mutationFn: receivePurchase,
    onSuccess: () => toast.success("Purchase received. Stock updated."),
    onSettled: () => Promise.all([refresh(), invalidateInventories(queryClient)]),
  })

  return {
    addPurchase,
    updatePurchase: updatePurchaseMutation,
    cancelPurchase: cancelPurchaseMutation,
    receivePurchase: receivePurchaseMutation,
    isSubmitting:
      addPurchase.isPending ||
      updatePurchaseMutation.isPending ||
      cancelPurchaseMutation.isPending ||
      receivePurchaseMutation.isPending,
  }
}
