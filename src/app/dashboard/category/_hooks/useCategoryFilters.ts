"use client"

import { oneOf, positiveInt, text, useUrlState, type UrlSchema } from "@/hooks/useUrlState"
import type { CategorySortBy } from "@/types/category"
import { categorySortOptions } from "../_lib/categoryHelpers"

interface CategoryFilters {
  search: string
  sortBy: CategorySortBy
  sortOrder: "asc" | "desc"
  page: number
}

const schema: UrlSchema<CategoryFilters> = {
  search: { param: "q", default: "", parse: text },
  sortBy: { param: "sort", default: "createdAt", parse: oneOf(categorySortOptions.map((option) => option.value)) },
  sortOrder: { param: "order", default: "desc", parse: oneOf(["asc", "desc"] as const) },
  page: { param: "page", default: 1, parse: positiveInt },
}

/** The category list's search, sort and page, stored in the URL (see `useUrlState`). */
export function useCategoryFilters() {
  return useUrlState(schema)
}
