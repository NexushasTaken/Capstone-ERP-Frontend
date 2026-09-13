import type { SalesSortBy } from '@/app/types/sale'
import type { SortOption } from '@/app/components/SortPopover'

export const saleSortOptions: SortOption<SalesSortBy>[] = [
  { label: 'Name (A to Z)', value: 'name', order: 'asc' },
  { label: 'Name (Z to A)', value: 'name', order: 'desc' },
  { label: 'Quantity (High to Low)', value: 'quantity', order: 'desc' },
  { label: 'Quantity (Low to High)', value: 'quantity', order: 'asc' },
]

export function getSaleFilter(value: { value: SalesSortBy; order: 'asc' | 'desc' }) {
  if (value.value === 'name') return value.order === 'asc' ? 1 : 2
  if (value.value === 'quantity') return value.order === 'desc' ? 3 : 4

  return 0
}
