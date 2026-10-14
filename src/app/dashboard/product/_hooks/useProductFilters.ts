"use client"

import { oneOf, positiveInt, text, useUrlState, type UrlSchema } from "@/hooks/useUrlState"
import type { ProductCategoryFilter, ProductSortBy } from "@/types/product"
import { productFilters, productSortOptions } from "../_lib/productHelpers"

interface ProductFilters {
  search: string
  filter: ProductCategoryFilter
  sortBy: ProductSortBy
  sortOrder: "asc" | "desc"
  page: number
}

const schema: UrlSchema<ProductFilters> = {
  search: { param: "q", default: "", parse: text },
  filter: { param: "filter", default: "Categorized", parse: oneOf(productFilters) },
  sortBy: { param: "sort", default: "createdAt", parse: oneOf(productSortOptions.map((option) => option.value)) },
  sortOrder: { param: "order", default: "desc", parse: oneOf(["asc", "desc"] as const) },
  page: { param: "page", default: 1, parse: positiveInt },
}

/** The product list's search, filter, sort and page, stored in the URL (see `useUrlState`). */
export function useProductFilters() {
  return useUrlState(schema)
}
