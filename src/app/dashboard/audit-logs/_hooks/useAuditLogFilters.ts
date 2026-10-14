"use client"

import { optionalInt, optionalText, positiveInt, useUrlState, type UrlSchema } from "@/hooks/useUrlState"

interface AuditLogFilters {
  userId: number | null
  role: string | null
  module: number | null
  action: number | null
  page: number
}

const schema: UrlSchema<AuditLogFilters> = {
  userId: { param: "user", default: null, parse: optionalInt },
  role: { param: "role", default: null, parse: optionalText },
  module: { param: "module", default: null, parse: optionalInt },
  action: { param: "action", default: null, parse: optionalInt },
  page: { param: "page", default: 1, parse: positiveInt },
}

/** The audit log list's filters and page, stored in the URL (see `useUrlState`). */
export function useAuditLogFilters() {
  return useUrlState(schema)
}
