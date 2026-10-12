"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  fetchOrderDrivers,
  fetchOrders,
  fetchOrderStatusCounts,
  fetchOrderStatuses,
  insertOrder,
  updateOrder as updateOrderApi,
  updateOrderStatus,
} from "@/services/orderApi"
import { isValidationError } from "@/lib/apiError"
import { invalidateInventories, invalidateOrders } from "@/lib/query/queryInvalidation"
import { queryKeys } from "@/lib/query/queryKeys"
import type { FetchOrdersParams } from "@/types/order"

export function useOrders(params: FetchOrdersParams) {
  return useQuery({
    queryKey: queryKeys.orders.all(params),
    queryFn: ({ signal }) => fetchOrders(params, signal),
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}

export function useOrderStatuses() {
  return useQuery({
    queryKey: queryKeys.orders.statuses,
    queryFn: fetchOrderStatuses,
  })
}

export function useOrderStatusCounts() {
  return useQuery({
    queryKey: queryKeys.orders.statusCounts,
    queryFn: ({ signal }) => fetchOrderStatusCounts(signal),
  })
}

export function useOrderDrivers() {
  return useQuery({
    queryKey: queryKeys.orders.drivers,
    queryFn: fetchOrderDrivers,
  })
}

export function useOrderMutations() {
  const queryClient = useQueryClient()

  const addOrder = useMutation({
    mutationFn: insertOrder,
    onSuccess: () => {
      toast.success("Order added successfully")
      invalidateOrders(queryClient)
      invalidateInventories(queryClient)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to add order")
    },
  })

  // Items move stock, so inventory is refreshed too. A 400 (e.g. not enough stock) is shown in the edit modal instead.
  const updateOrder = useMutation({
    mutationFn: updateOrderApi,
    onSuccess: () => {
      toast.success("Order updated successfully")
      invalidateOrders(queryClient)
      invalidateInventories(queryClient)
    },
    onError: (err) => {
      if (isValidationError(err)) return
      toast.error(err instanceof Error ? err.message : "Failed to update order")
    },
  })

  const updateStatus = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      toast.success("Order status updated successfully")
      invalidateOrders(queryClient)
      invalidateInventories(queryClient)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update order status")
    },
  })

  return { addOrder, updateOrder, updateStatus }
}
