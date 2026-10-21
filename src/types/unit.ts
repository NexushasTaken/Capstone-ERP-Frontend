export interface UnitListItem {
  id: number
  name: string
  /** Active products counted in this unit; a unit in use can't be deleted. */
  productCount: number
  created_At: string
}

export type UnitSortBy = "id" | "createdAt" | "name"

export interface UnitSortOption {
  label: string
  value: UnitSortBy
  order: "asc" | "desc"
}

// API request/response shapes

export interface UnitListContent {
  units: UnitListItem[]
  pageCount: number
  rows: number
}

export interface FetchUnitsParams {
  page?: number
  pageSize?: number
  name?: string
  /** Sort code, see getUnitFilter. */
  filter?: number
}

export interface InsertUnitPayload {
  name: string
}

export interface UpdateUnitPayload {
  id: number
  name: string
}
