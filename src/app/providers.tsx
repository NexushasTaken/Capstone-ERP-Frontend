'use client'

import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { invalidateAuditLogs } from '@/lib/query/queryInvalidation'
import React, { useState } from 'react'

function makeQueryClient() {
  const client: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: true,
      },
    },
    // The backend writes an audit log for every successful change, so refresh the logs after any mutation.
    mutationCache: new MutationCache({
      onSuccess: () => {
        invalidateAuditLogs(client)
      },
    }),
  })
  return client
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // One client per browser session; useState keeps it stable across renders.
  const [queryClient] = useState(makeQueryClient)

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
