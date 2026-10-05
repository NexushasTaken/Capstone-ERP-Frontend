export interface DriverListItem {
  id: number
  firstName: string
  lastName: string
  created_At: string
}

export type DriverSortBy = "createdAt" | "name"

export interface DriverSortOption {
  label: string
  value: DriverSortBy
  order: "asc" | "desc"
}

// API request/response shapes

export interface FetchDriversParams {
  page?: number
  pageSize?: number
  name?: string
  filter?: number
}

export interface DriverListContent {
  deliveryDrivers: DriverListItem[]
  pageCount: number
  rows: number
}

export interface InsertDriverPayload {
  firstName: string
  lastName: string
}

export interface UpdateDriverPayload extends InsertDriverPayload {
  id: number
}
