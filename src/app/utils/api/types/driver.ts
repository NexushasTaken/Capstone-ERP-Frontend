import type { DriverListItem } from '@/app/types/driver'

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
