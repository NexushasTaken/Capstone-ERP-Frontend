"use client"

import { oneOf, positiveInt, text, useUrlState, type UrlSchema } from "@/hooks/useUrlState"
import type { PurchaseSortBy } from "@/types/purchase"

interface PurchaseFilters {
  search: string
  status: string
  sortBy: PurchaseSortBy
  sortOrder: "asc" | "desc"
  page: number
}

const schema: UrlSchema<PurchaseFilters> = {
  search: { param: "q", default: "", parse: text },
  status: { param: "status", default: "All", parse: text },
  sortBy: { param: "sort", default: "orderedOn", parse: oneOf(["orderedOn"] as const) },
  sortOrder: { param: "order", default: "desc", parse: oneOf(["asc", "desc"] as const) },
  page: { param: "page", default: 1, parse: positiveInt },
}

/** The purchase list's search, status, sort and page, stored in the URL (see `useUrlState`). */
export function usePurchaseFilters() {
  return useUrlState(schema)
}
