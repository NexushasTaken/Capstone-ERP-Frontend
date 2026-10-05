"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { InventorySortBy } from "@/types/inventory"

export interface InventoryFilters {
  search: string
  status: string
  /** "" for any warehouse, otherwise a warehouse id. */
  warehouse: string
  /** "" for any category, otherwise a category id. */
  category: string
  minQuantity: string
  maxQuantity: string
  /** yyyy-MM-dd, or "" when unset. */
  dateFrom: string
  dateTo: string
  sortBy: InventorySortBy
  sortOrder: "asc" | "desc"
  page: number
}

type Patch = Partial<InventoryFilters>

// URL parameter for each field. A field equal to its default is left out of the URL.
const paramNames: Record<keyof InventoryFilters, string> = {
  search: "q",
  status: "status",
  warehouse: "warehouse",
  category: "category",
  minQuantity: "minQty",
  maxQuantity: "maxQty",
  dateFrom: "from",
  dateTo: "to",
  sortBy: "sort",
  sortOrder: "order",
  page: "page",
}

const defaults: InventoryFilters = {
  search: "",
  status: "All",
  warehouse: "",
  category: "",
  minQuantity: "",
  maxQuantity: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "latest",
  sortOrder: "asc",
  page: 1,
}

const sortKeys: InventorySortBy[] = ["latest", "name", "quantity", "reorderPoint", "warehouseId"]

function readCount(value: string | null) {
  return value !== null && /^\d+$/.test(value) ? value : ""
}

function readDate(value: string | null) {
  return value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ""
}

/**
 * The inventory list's search, filters, sort and page, stored in the URL so they survive a refresh and
 * can be shared. Anything that changes the result set (everything except `page`) goes back to page 1.
 */
export function useInventoryFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const sort = searchParams.get(paramNames.sortBy) as InventorySortBy | null
  const page = Number(searchParams.get(paramNames.page))

  const filters: InventoryFilters = {
    search: searchParams.get(paramNames.search) ?? defaults.search,
    status: searchParams.get(paramNames.status) ?? defaults.status,
    warehouse: readCount(searchParams.get(paramNames.warehouse)),
    category: readCount(searchParams.get(paramNames.category)),
    minQuantity: readCount(searchParams.get(paramNames.minQuantity)),
    maxQuantity: readCount(searchParams.get(paramNames.maxQuantity)),
    dateFrom: readDate(searchParams.get(paramNames.dateFrom)),
    dateTo: readDate(searchParams.get(paramNames.dateTo)),
    sortBy: sort && sortKeys.includes(sort) ? sort : defaults.sortBy,
    sortOrder: searchParams.get(paramNames.sortOrder) === "desc" ? "desc" : defaults.sortOrder,
    page: Number.isInteger(page) && page > 0 ? page : defaults.page,
  }

  function update(patch: Patch) {
    const next = { ...filters, ...patch }
    if (!("page" in patch)) next.page = defaults.page

    const params = new URLSearchParams()
    for (const key of Object.keys(paramNames) as (keyof InventoryFilters)[]) {
      if (next[key] !== defaults[key]) params.set(paramNames[key], String(next[key]))
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  // Search and sort are not "filters" the user can clear, so they don't count here.
  const hasFilters =
    filters.status !== defaults.status ||
    filters.warehouse !== defaults.warehouse ||
    filters.category !== defaults.category ||
    filters.minQuantity !== defaults.minQuantity ||
    filters.maxQuantity !== defaults.maxQuantity ||
    filters.dateFrom !== defaults.dateFrom ||
    filters.dateTo !== defaults.dateTo

  function clearFilters() {
    update({
      status: defaults.status,
      warehouse: defaults.warehouse,
      category: defaults.category,
      minQuantity: defaults.minQuantity,
      maxQuantity: defaults.maxQuantity,
      dateFrom: defaults.dateFrom,
      dateTo: defaults.dateTo,
    })
  }

  return { filters, update, hasFilters, clearFilters }
}
