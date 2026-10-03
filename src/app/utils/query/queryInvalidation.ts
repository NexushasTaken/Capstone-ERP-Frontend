import type { QueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/app/utils/query/queryKeys'

export function invalidateProducts(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ['products'] })
}

export function invalidateOrders(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ['orders'] })
}

export function invalidateInventories(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ['inventories'] })
}

export function invalidateCategories(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ['categories'] })
}

export function invalidateDrivers(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ['drivers'] })
}

export function invalidateWarehouses(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all })
}

export function invalidateAuditLogs(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
}

export function invalidateAccounts(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
}
