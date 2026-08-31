import { ProductCategoryFilter } from '@/app/types/product'

export type ProductSortBy = 'id' | 'name' | 'price' | 'createdAt'

export interface ProductSortOption {
  label: string
  value: ProductSortBy
  order: 'asc' | 'desc'
}

export const productSortOptions: ProductSortOption[] = [
  { label: 'Latest added', value: 'createdAt', order: 'desc' },
  { label: 'Id', value: 'id', order: 'asc' },
  { label: 'Product Name (A to Z)', value: 'name', order: 'asc' },
  { label: 'Product Name (Z to A)', value: 'name', order: 'desc' },
  { label: 'Price Low', value: 'price', order: 'asc' },
  { label: 'Price High', value: 'price', order: 'desc' },
]

export function formatProductId(productId: string | number) {
  return `PR-${productId}`
}

export function formatDate(dateString: string | null) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function productStatusDotClass(isActive: boolean) {
  return isActive ? 'bg-[#39B82C]' : 'bg-[#D92D20]'
}

export function productStatusTextClass(isActive: boolean) {
  return isActive ? 'text-[#1F7A1F]' : 'text-[#B42318]'
}

export const tableColumns = ['Product ID', 'Category', 'Product Name', 'Price', 'Created At']
export const ITEMS_PER_PAGE = 10
export const PRODUCT_LOAD_PAGE_SIZE = 1000

export const categoryPresentByFilter: Record<ProductCategoryFilter, 0 | 1> = {
  Categorized: 0,
  Uncategorized: 1,
}
