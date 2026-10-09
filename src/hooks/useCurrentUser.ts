"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchCurrentUser, readStoredCurrentUser } from "@/services/profileApi"
import { queryKeys } from "@/lib/query/queryKeys"

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: fetchCurrentUser,
    // `undefined` (not null) when nothing is stored, so the query fetches instead of trusting "no user".
    initialData: () => readStoredCurrentUser() ?? undefined,
    // A stored user shows instantly but is always re-checked against the backend on mount.
    initialDataUpdatedAt: 0,
  })
}
