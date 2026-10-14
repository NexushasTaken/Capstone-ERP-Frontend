"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export interface UrlField<T> {
  /** URL parameter name. The parameter is left out of the URL while the field equals `default`. */
  param: string
  default: T
  /** Turns the raw parameter (null when absent) into a value; return `default` for anything invalid. */
  parse: (raw: string | null, fallback: T) => T
}

export type UrlSchema<V> = { [K in keyof V]: UrlField<V[K]> }

// Parsers for common field types.
export const text = (raw: string | null, fallback: string) => raw ?? fallback
/** A non-negative whole number kept as a string ("" = not set), e.g. an id or a quantity bound. */
export const digits = (raw: string | null, fallback: string) => (raw !== null && /^\d+$/.test(raw) ? raw : fallback)
/** A calendar day as `yyyy-MM-dd` ("" = not set). */
export const isoDate = (raw: string | null, fallback: string) =>
  raw !== null && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : fallback
export const positiveInt = (raw: string | null, fallback: number) => {
  const value = Number(raw)
  return raw !== null && Number.isSafeInteger(value) && value > 0 ? value : fallback
}
/** A whole number, or null when not set (e.g. an optional id filter). */
export const optionalInt = (raw: string | null, fallback: number | null) =>
  raw !== null && /^\d+$/.test(raw) ? Number(raw) : fallback
export const optionalText = (raw: string | null, fallback: string | null) => raw ?? fallback
export const bool = (raw: string | null, fallback: boolean) =>
  raw === "true" ? true : raw === "false" ? false : fallback
export function oneOf<T extends string>(options: readonly T[]) {
  return (raw: string | null, fallback: T) => (options.includes(raw as T) ? (raw as T) : fallback)
}

/**
 * List state (search, filters, sort, page) stored in the URL so it survives a refresh and can be shared.
 * `schema` must be a module-level constant. Parameters not in the schema are kept untouched.
 * A patch without `page` sends the list back to page 1, since the result set has changed.
 */
export function useUrlState<V extends { page: number }>(schema: UrlSchema<V>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const values = {} as V
  for (const key of Object.keys(schema) as (keyof V)[]) {
    const field = schema[key]
    values[key] = field.parse(searchParams.get(field.param), field.default)
  }

  const update = useCallback(
    (patch: Partial<V>) => {
      const params = new URLSearchParams(searchParams.toString())
      const full: Partial<V> = "page" in patch ? patch : { ...patch, page: schema.page.default }
      for (const key of Object.keys(full) as (keyof V)[]) {
        const field = schema[key]
        const value = full[key]
        if (value === field.default) params.delete(field.param)
        else params.set(field.param, String(value))
      }
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [schema, searchParams, pathname, router],
  )

  return { values, update }
}
