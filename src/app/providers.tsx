'use client'

import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { invalidateAuditLogs } from '@/lib/query/queryInvalidation';
import React, { useState } from 'react'

export default function Providers({ 
    children,
}: {
    children: React.ReactNode
}) {
    const [queryClient] = useState(() => {
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
    });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
