export type CategorySortBy = 'id' | 'createdAt' | 'name'

export interface CategorySortOption {
  label: string
  value: CategorySortBy
  order: 'asc' | 'desc'
}

export const categorySortOptions: CategorySortOption[] = [
  { label: 'Latest added', value: 'createdAt', order: 'desc' },
  { label: 'Id', value: 'id', order: 'asc' },
  { label: 'Type (A to Z)', value: 'name', order: 'asc' },
  { label: 'Type (Z to A)', value: 'name', order: 'desc' },
]

export function formatCategoryId(categoryId: string | number) {
  return `CAT-${categoryId}`
}

export function formatCategoryDate(dateString: string | null) {
  if (!dateString) return '-'

  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const tableColumns = [
  'Id',
  'Type',
  'Created At',
  'Action',
]

export const ITEMS_PER_PAGE = 10