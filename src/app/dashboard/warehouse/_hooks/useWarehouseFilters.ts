"use client"

import { oneOf, positiveInt, text, useUrlState, type UrlSchema } from "@/hooks/useUrlState"
import type { WarehouseSortBy } from "@/types/warehouse"
import { warehouseSortOptions } from "../_lib/warehouseHelpers"

interface WarehouseFilters {
  search: string
  sortBy: WarehouseSortBy
  sortOrder: "asc" | "desc"
  page: number
}

const schema: UrlSchema<WarehouseFilters> = {
  search: { param: "q", default: "", parse: text },
  sortBy: { param: "sort", default: "createdAt", parse: oneOf(warehouseSortOptions.map((option) => option.value)) },
  sortOrder: { param: "order", default: "desc", parse: oneOf(["asc", "desc"] as const) },
  page: { param: "page", default: 1, parse: positiveInt },
}

/** The warehouse list's search, sort and page, stored in the URL (see `useUrlState`). */
export function useWarehouseFilters() {
  return useUrlState(schema)
}
