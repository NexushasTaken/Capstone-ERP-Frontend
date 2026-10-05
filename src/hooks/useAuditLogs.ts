'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchAuditLogs, fetchUsers } from '@/services/auditLogApi'
import type { FetchAuditLogsParams } from '@/types/auditLog'
import { queryKeys } from '@/lib/query/queryKeys'

// New logs only appear as a side effect of other actions, so callers can poll
// (`refetchInterval`) to pick up changes made by other users.
export function useAuditLogs(params: FetchAuditLogsParams, options: { refetchInterval?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.auditLogs.all(params),
    queryFn: ({ signal }) => fetchAuditLogs(params, signal),
    keepPreviousData: true,
    refetchInterval: options.refetchInterval,
  })
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: ({ signal }) => fetchUsers(signal),
    staleTime: 5 * 60_000,
  })
}
