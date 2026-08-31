import { ProductCategoryFilter } from '@/app/types/product'
import { mockProducts } from '@/app/utils/mock/productMockData'

export type ProductSortBy = 'name' | 'price' | 'createdAt'

export interface ProductSortOption {
  label: string
  value: ProductSortBy
  order: 'asc' | 'desc'
}

export const productFilters = [
  { label: 'All', count: mockProducts.length },
  { label: 'Active', count: mockProducts.filter((product) => product.isActive).length },
  { label: 'Inactive', count: mockProducts.filter((product) => !product.isActive).length },
] as const

export const productSortOptions: ProductSortOption[] = [
  { label: 'Newest first', value: 'createdAt', order: 'desc' },
  { label: 'Oldest first', value: 'createdAt', order: 'asc' },
  { label: 'Name (A to Z)', value: 'name', order: 'asc' },
  { label: 'Name (Z to A)', value: 'name', order: 'desc' },
  { label: 'Price (High to low)', value: 'price', order: 'desc' },
  { label: 'Price (Low to high)', value: 'price', order: 'asc' },
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