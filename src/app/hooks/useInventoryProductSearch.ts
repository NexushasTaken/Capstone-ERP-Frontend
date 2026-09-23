'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchInventoryProducts } from '@/app/services/inventoryApi'
import { queryKeys } from '@/app/utils/query/queryKeys'

export function useInventoryProductSearch(enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.inventories.productsForInsert,
    queryFn: ({ signal }) => fetchInventoryProducts(signal),
    enabled,
  })
  const products = query.isError ? [] : query.data ?? []

  return {
    products,
    isLoading: query.isInitialLoading,
    error: query.error,
  }
}
