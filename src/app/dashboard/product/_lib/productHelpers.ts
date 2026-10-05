import type { ProductCategoryFilter, ProductListItem, ProductSortBy, ProductSortOption } from '@/types/product'

export const ITEMS_PER_PAGE = 10
// The page loads up to this many products at once, then filters, sorts and pages them in the browser.
export const PRODUCT_LOAD_PAGE_SIZE = 1000

export const productFilters: ProductCategoryFilter[] = ['Categorized', 'Uncategorized']

export const categoryPresentByFilter: Record<ProductCategoryFilter, 0 | 1> = {
  Categorized: 0,
  Uncategorized: 1,
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

export function hasCategory(product: ProductListItem) {
  return product.categoryId !== null && product.categoryId !== 0
}

export function matchesFilter(product: ProductListItem, filter: ProductCategoryFilter) {
  return filter === 'Categorized' ? hasCategory(product) : !hasCategory(product)
}

export function sortProducts(products: ProductListItem[], sortBy: ProductSortBy, sortOrder: 'asc' | 'desc') {
  const direction = sortOrder === 'asc' ? 1 : -1

  return [...products].sort((a, b) => {
    switch (sortBy) {
      case 'id':
        return (a.id - b.id) * direction
      case 'name':
        return a.name.localeCompare(b.name) * direction
      case 'price':
        return (a.price - b.price) * direction
      case 'createdAt':
        return (Date.parse(a.created_At) - Date.parse(b.created_At)) * direction
      default:
        return 0
    }
  })
}
