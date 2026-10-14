"use client"

import { bool, positiveInt, text, useUrlState, type UrlSchema } from "@/hooks/useUrlState"

interface ForecastFilters {
  search: string
  needOrderOnly: boolean
  page: number
}

const schema: UrlSchema<ForecastFilters> = {
  search: { param: "q", default: "", parse: text },
  needOrderOnly: { param: "needOrder", default: false, parse: bool },
  page: { param: "page", default: 1, parse: positiveInt },
}

/** The forecast list's search, filter and page, stored in the URL (see `useUrlState`). */
export function useForecastFilters() {
  return useUrlState(schema)
}
