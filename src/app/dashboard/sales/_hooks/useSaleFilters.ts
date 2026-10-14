"use client"

import { digits, isoDate, oneOf, positiveInt, text, useUrlState, type UrlSchema } from "@/hooks/useUrlState"
import type { SaleSortBy } from "@/types/sale"
import { saleSortOptions } from "../_lib/saleSort"

interface SaleFilters {
  search: string
  /** "" for any order type, otherwise an order type id. */
  orderType: string
  /** First and last sale day, `yyyy-MM-dd`; "" = no bound. */
  from: string
  to: string
  sortBy: SaleSortBy
  sortOrder: "asc" | "desc"
  page: number
}

const schema: UrlSchema<SaleFilters> = {
  search: { param: "q", default: "", parse: text },
  orderType: { param: "type", default: "", parse: digits },
  from: { param: "from", default: "", parse: isoDate },
  to: { param: "to", default: "", parse: isoDate },
  sortBy: { param: "sort", default: "date", parse: oneOf(saleSortOptions.map((option) => option.value)) },
  sortOrder: { param: "order", default: "desc", parse: oneOf(["asc", "desc"] as const) },
  page: { param: "page", default: 1, parse: positiveInt },
}

/** The sales list's search, filters, sort and page, stored in the URL (see `useUrlState`). */
export function useSaleFilters() {
  return useUrlState(schema)
}
