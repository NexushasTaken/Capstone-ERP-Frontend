"use client"

import { digits, positiveInt, text, useUrlState, type UrlSchema } from "@/hooks/useUrlState"

interface OrderFilters {
  search: string
  /** "" for any order type, otherwise an order type id. */
  orderType: string
  /** "" for any status, otherwise an order status id. */
  status: string
  page: number
}

const schema: UrlSchema<OrderFilters> = {
  search: { param: "q", default: "", parse: text },
  orderType: { param: "type", default: "", parse: digits },
  status: { param: "status", default: "", parse: digits },
  page: { param: "page", default: 1, parse: positiveInt },
}

/** The order list's search, filters and page, stored in the URL (see `useUrlState`). */
export function useOrderFilters() {
  return useUrlState(schema)
}
