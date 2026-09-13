export interface DriverListItem {
  id: number
  firstName: string
  lastName: string
  created_At: string
}

export type DriverSortBy = 'createdAt' | 'name'

export interface DriverSortOption {
  label: string
  value: DriverSortBy
  order: 'asc' | 'desc'
}
