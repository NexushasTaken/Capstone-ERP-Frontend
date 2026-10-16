"use client"

import { digits, oneOf, positiveInt, text, useUrlState, type UrlSchema } from "@/hooks/useUrlState"
import type { InventorySortBy } from "@/types/inventory"

export interface InventoryFilters {
  search: string
  status: string
  /** "" for any category, otherwise a category id. */
  category: string
  minQuantity: string
  maxQuantity: string
  sortBy: InventorySortBy
  sortOrder: "asc" | "desc"
  page: number
}

const sortKeys: InventorySortBy[] = ["latest", "name", "quantity", "reorderPoint"]

const schema: UrlSchema<InventoryFilters> = {
  search: { param: "q", default: "", parse: text },
  status: { param: "status", default: "All", parse: text },
  category: { param: "category", default: "", parse: digits },
  minQuantity: { param: "minQty", default: "", parse: digits },
  maxQuantity: { param: "maxQty", default: "", parse: digits },
  sortBy: { param: "sort", default: "latest", parse: oneOf(sortKeys) },
  sortOrder: { param: "order", default: "asc", parse: oneOf(["asc", "desc"] as const) },
  page: { param: "page", default: 1, parse: positiveInt },
}

/** The inventory list's search, filters, sort and page, stored in the URL (see `useUrlState`). */
export function useInventoryFilters() {
  const { values: filters, update } = useUrlState(schema)

  // Search and sort are not "filters" the user can clear, so they don't count here.
  const hasFilters =
    filters.status !== schema.status.default ||
    filters.category !== schema.category.default ||
    filters.minQuantity !== schema.minQuantity.default ||
    filters.maxQuantity !== schema.maxQuantity.default

  function clearFilters() {
    update({
      status: schema.status.default,
      category: schema.category.default,
      minQuantity: schema.minQuantity.default,
      maxQuantity: schema.maxQuantity.default,
    })
  }

  return { filters, update, hasFilters, clearFilters }
}
