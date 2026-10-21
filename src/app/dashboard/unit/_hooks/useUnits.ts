"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteUnit, fetchUnits, insertUnit, updateUnit } from "@/services/unitApi"
import { optimisticUpdate } from "@/lib/query/optimisticUpdate"
import { queryKeys } from "@/lib/query/queryKeys"
import type { FetchUnitsParams, UnitListItem } from "@/types/unit"

type UnitsResponse = Awaited<ReturnType<typeof fetchUnits>>

export interface UnitsQuery {
  page: number
  pageSize: number
  search: string
  /** Sort code, see getUnitFilter. */
  sort: number
}

function unitsParams({ page, pageSize, search, sort }: UnitsQuery): FetchUnitsParams {
  return { page, pageSize, name: search || undefined, filter: sort }
}

export function useUnits(query: UnitsQuery) {
  const params = unitsParams(query)
  return useQuery({
    queryKey: queryKeys.units.all(params),
    queryFn: () => fetchUnits(params),
    placeholderData: keepPreviousData,
  })
}

// Add/edit/delete for the units page. Each one updates the visible page in the cache straight away.
// Units appear on products, so changes also refresh the product list.
export function useUnitMutations(query: UnitsQuery) {
  const queryClient = useQueryClient()
  const shared = {
    queryClient,
    queryKey: queryKeys.units.all(unitsParams(query)),
    scopeKey: ["units"],
  }

  const addUnit = useMutation({
    mutationFn: ({ name }: { name: string; optimisticId: number }) => insertUnit({ name }),
    ...optimisticUpdate<UnitsResponse, { name: string; optimisticId: number }>({
      ...shared,
      update: (current, { name, optimisticId }) => {
        const tempUnit: UnitListItem = {
          id: optimisticId,
          name: name.trim().toLowerCase(),
          productCount: 0,
          created_At: new Date().toISOString(),
        }
        return {
          ...current,
          items: [tempUnit, ...current.items].slice(0, query.pageSize),
          rows: current.rows + 1,
        }
      },
      successMessage: "Unit added successfully",
      errorMessage: "Failed to add unit",
    }),
  })

  const updateUnitMutation = useMutation({
    mutationFn: updateUnit,
    ...optimisticUpdate<UnitsResponse, { id: number; name: string }>({
      ...shared,
      update: (current, { id, name }) => ({
        ...current,
        items: current.items.map((unit) => (unit.id === id ? { ...unit, name: name.trim().toLowerCase() } : unit)),
      }),
      successMessage: "Unit updated successfully",
      errorMessage: "Failed to update unit",
    }),
    // replaces optimisticUpdate's own refetch, so refetch units here too
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["units"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]),
  })

  const deleteUnitMutation = useMutation({
    mutationFn: deleteUnit,
    ...optimisticUpdate<UnitsResponse, number>({
      ...shared,
      update: (current, unitId) => ({
        ...current,
        items: current.items.filter((unit) => unit.id !== unitId),
        rows: Math.max(0, current.rows - 1),
      }),
      successMessage: "Unit deleted successfully",
      errorMessage: "Failed to delete unit",
    }),
  })

  return {
    addUnit,
    updateUnit: updateUnitMutation,
    deleteUnit: deleteUnitMutation,
    isSubmitting: addUnit.isPending || updateUnitMutation.isPending || deleteUnitMutation.isPending,
  }
}
