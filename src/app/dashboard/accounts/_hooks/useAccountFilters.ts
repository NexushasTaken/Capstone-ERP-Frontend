"use client"

import { oneOf, positiveInt, text, useUrlState, type UrlSchema } from "@/hooks/useUrlState"
import type { AccountSortBy } from "@/types/account"
import { accountSortOptions } from "../_lib/accountHelpers"

interface AccountFilters {
  search: string
  sortBy: AccountSortBy
  sortOrder: "asc" | "desc"
  page: number
}

const schema: UrlSchema<AccountFilters> = {
  search: { param: "q", default: "", parse: text },
  sortBy: { param: "sort", default: "id", parse: oneOf(accountSortOptions.map((option) => option.value)) },
  sortOrder: { param: "order", default: "asc", parse: oneOf(["asc", "desc"] as const) },
  page: { param: "page", default: 1, parse: positiveInt },
}

/** The account list's search, sort and page, stored in the URL (see `useUrlState`). */
export function useAccountFilters() {
  return useUrlState(schema)
}
