'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchOrderRiders,
  fetchOrders,
  fetchOrderStatusCounts,
  fetchOrderStatuses,
  insertOrder,
  updateOrderStatus,
} from '@/services/orderApi'
import { invalidateOrders } from '@/lib/query/queryInvalidation'
import { queryKeys } from '@/lib/query/queryKeys'
import type { FetchOrdersParams } from '@/types/order'

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

export function useOrderRiders() {
  return useQuery({
    queryKey: queryKeys.orders.riders,
    queryFn: fetchOrderRiders,
  })
}

export function useOrderMutations() {
  const queryClient = useQueryClient()

  const addOrder = useMutation({
    mutationFn: insertOrder,
    onSuccess: () => {
      toast.success('Order added successfully')
      invalidateOrders(queryClient)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add order')
    },
  })

  const updateStatus = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      toast.success('Order status updated successfully')
      invalidateOrders(queryClient)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update order status')
    },
  })

  return { addOrder, updateStatus }
}
