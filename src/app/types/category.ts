export interface CategoryListItem {
  id: number
  type: string
  created_At: string
}

export type CategorySortBy = 'id' | 'createdAt' | 'name'

export interface CategorySortOption {
  label: string
  value: CategorySortBy
  order: 'asc' | 'desc'
}

