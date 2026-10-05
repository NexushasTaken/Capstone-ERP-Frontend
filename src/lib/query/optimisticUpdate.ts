import type { QueryClient, QueryKey, UseMutationOptions } from "@tanstack/react-query"
import { toast } from "sonner"

interface OptimisticUpdateOptions<TData, TVariables> {
  queryClient: QueryClient
  /** The exact cached query to update right away (e.g. the current page). */
  queryKey: QueryKey
  /** Prefix of every query to cancel before and refetch after, e.g. ['products']. */
  scopeKey: QueryKey
  /** Returns the cached data as it should look once the mutation succeeds. */
  update: (current: TData, variables: TVariables) => TData
  successMessage: string
  errorMessage: string
}

/**
 * Mutation callbacks that update the cached list immediately (so the UI feels instant),
 * roll back and show an error toast if the request fails, and refetch afterwards.
 * Spread the result into `useMutation({ mutationFn, ...optimisticUpdate({...}) })`.
 */
export function optimisticUpdate<TData, TVariables>({
  queryClient,
  queryKey,
  scopeKey,
  update,
  successMessage,
  errorMessage,
}: OptimisticUpdateOptions<TData, TVariables>): Pick<
  UseMutationOptions<unknown, unknown, TVariables, { previous?: TData }>,
  "onMutate" | "onError" | "onSuccess" | "onSettled"
> {
  return {
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: scopeKey })
      const previous = queryClient.getQueryData<TData>(queryKey)
      queryClient.setQueryData<TData>(queryKey, (current) => current && update(current, variables))
      return { previous }
    },
    onError: (err, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
      toast.error(err instanceof Error ? err.message : errorMessage)
    },
    onSuccess: () => {
      toast.success(successMessage)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: scopeKey }),
  }
}
