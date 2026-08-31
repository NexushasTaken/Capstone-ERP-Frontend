import type { QueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/app/utils/api/queryKeys'

export function invalidateProducts(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ['products'] })
}

export function invalidateInventories(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ['inventories'] })
}

export function invalidateCategories(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
}

export function invalidateWarehouses(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all })
}
