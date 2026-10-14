"use client"

import { oneOf, positiveInt, text, useUrlState, type UrlSchema } from "@/hooks/useUrlState"
import type { DriverSortBy } from "@/types/driver"
import { driverSortOptions } from "../_lib/driverHelpers"

interface DriverFilters {
  search: string
  sortBy: DriverSortBy
  sortOrder: "asc" | "desc"
  page: number
}

const schema: UrlSchema<DriverFilters> = {
  search: { param: "q", default: "", parse: text },
  sortBy: { param: "sort", default: "createdAt", parse: oneOf(driverSortOptions.map((option) => option.value)) },
  sortOrder: { param: "order", default: "desc", parse: oneOf(["asc", "desc"] as const) },
  page: { param: "page", default: 1, parse: positiveInt },
}

/** The driver list's search, sort and page, stored in the URL (see `useUrlState`). */
export function useDriverFilters() {
  return useUrlState(schema)
}
