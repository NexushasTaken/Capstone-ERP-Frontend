"use client"

import { digits, positiveInt, text, useUrlState, type UrlSchema } from "@/hooks/useUrlState"

interface SaleFilters {
  search: string
  /** "" for any order type, otherwise an order type id. */
  orderType: string
  page: number
}

const schema: UrlSchema<SaleFilters> = {
  search: { param: "q", default: "", parse: text },
  orderType: { param: "type", default: "", parse: digits },
  page: { param: "page", default: 1, parse: positiveInt },
}

/** The sales list's search, filter and page, stored in the URL (see `useUrlState`). */
export function useSaleFilters() {
  return useUrlState(schema)
}
