'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchOrderTypes } from '@/services/orderApi'
import { queryKeys } from '@/lib/query/queryKeys'

export function useOrderTypes() {
  return useQuery({
    queryKey: queryKeys.orders.types,
    queryFn: fetchOrderTypes,
  })
}
