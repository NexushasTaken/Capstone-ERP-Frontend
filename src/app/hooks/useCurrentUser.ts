'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchCurrentUser, readStoredCurrentUser } from '@/app/services/profileApi'
import { queryKeys } from '@/app/utils/query/queryKeys'

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: fetchCurrentUser,
    initialData: readStoredCurrentUser,
  })
}
