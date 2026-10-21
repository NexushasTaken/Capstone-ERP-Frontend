"use client"

import { oneOf, positiveInt, text, useUrlState, type UrlSchema } from "@/hooks/useUrlState"
import type { UnitSortBy } from "@/types/unit"
import { unitSortOptions } from "../_lib/unitHelpers"

interface UnitFilters {
  search: string
  sortBy: UnitSortBy
  sortOrder: "asc" | "desc"
  page: number
}

const schema: UrlSchema<UnitFilters> = {
  search: { param: "q", default: "", parse: text },
  sortBy: { param: "sort", default: "createdAt", parse: oneOf(unitSortOptions.map((option) => option.value)) },
  sortOrder: { param: "order", default: "desc", parse: oneOf(["asc", "desc"] as const) },
  page: { param: "page", default: 1, parse: positiveInt },
}

/** The unit list's search, sort and page, stored in the URL (see `useUrlState`). */
export function useUnitFilters() {
  return useUrlState(schema)
}
