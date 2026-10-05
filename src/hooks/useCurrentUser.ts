'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchCurrentUser, readStoredCurrentUser } from '@/services/profileApi'
import { queryKeys } from '@/lib/query/queryKeys'

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: fetchCurrentUser,
    initialData: readStoredCurrentUser,
  })
}
