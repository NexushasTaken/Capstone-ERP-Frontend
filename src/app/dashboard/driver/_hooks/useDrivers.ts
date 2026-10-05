"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { deleteDriver, fetchDrivers, insertDriver, updateDriver } from "@/services/driverApi"
import { invalidateDrivers } from "@/lib/query/queryInvalidation"
import { queryKeys } from "@/lib/query/queryKeys"
import type { FetchDriversParams } from "@/types/driver"

export function useDrivers(params: FetchDriversParams) {
  return useQuery({
    queryKey: queryKeys.drivers.all(params),
    queryFn: ({ signal }) => fetchDrivers(params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useDriverMutations() {
  const queryClient = useQueryClient()
  const callbacks = (successMessage: string, errorMessage: string) => ({
    onSuccess: () => {
      toast.success(successMessage)
      invalidateDrivers(queryClient)
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : errorMessage)
    },
  })

  const addDriver = useMutation({
    mutationFn: insertDriver,
    ...callbacks("Driver added successfully", "Failed to add driver"),
  })
  const updateDriverMutation = useMutation({
    mutationFn: updateDriver,
    ...callbacks("Driver updated successfully", "Failed to update driver"),
  })
  const deleteDriverMutation = useMutation({
    mutationFn: deleteDriver,
    ...callbacks("Driver deleted successfully", "Failed to delete driver"),
  })

  return {
    addDriver,
    updateDriver: updateDriverMutation,
    deleteDriver: deleteDriverMutation,
    isSubmitting: addDriver.isPending || updateDriverMutation.isPending || deleteDriverMutation.isPending,
  }
}
