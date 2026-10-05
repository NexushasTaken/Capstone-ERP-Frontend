"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createAccount, fetchAccounts, updateAccountRole } from "@/services/accountApi"
import { isValidationError } from "@/lib/apiError"
import { invalidateAccounts } from "@/lib/query/queryInvalidation"
import { queryKeys } from "@/lib/query/queryKeys"
import type { AccountListItem, FetchAccountsParams } from "@/types/account"

export function useAccounts(params: FetchAccountsParams) {
  return useQuery({
    queryKey: queryKeys.accounts.list(params),
    queryFn: ({ signal }) => fetchAccounts(params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useAccountMutations() {
  const queryClient = useQueryClient()

  const createAccountMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => toast.success("Account created successfully"),
    // Rejected inputs are shown inside the form, so only toast other failures.
    onError: (err) => {
      if (isValidationError(err)) return
      toast.error(err instanceof Error ? err.message : "Failed to create account")
    },
    onSettled: () => invalidateAccounts(queryClient),
  })

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: number; role: AccountListItem["role"] }) => updateAccountRole(id, role),
    onSuccess: () => toast.success("Account updated successfully"),
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update account"),
    onSettled: () => invalidateAccounts(queryClient),
  })

  return {
    createAccount: createAccountMutation,
    updateRole,
    isSubmitting: createAccountMutation.isPending || updateRole.isPending,
  }
}
