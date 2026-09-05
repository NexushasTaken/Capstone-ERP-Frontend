export interface Product {
  id: string
  categoryId: string
  name: string
  price: number
  createdBy: string
  createdAt: string
  updatedBy: string | null
  updatedAt: string | null
  deletedBy: string | null
  deletedAt: string | null
  isActive: boolean
}

export interface ProductListItem {
  id: number
  categoryId: number | null
  name: string
  price: number
  categoryName: string | null
  created_At: string
}

export type ProductCategoryFilter = 'Categorized' | 'Uncategorized'

export type ProductSortBy = 'id' | 'name' | 'price' | 'createdAt'

export interface ProductSortOption {
  label: string
  value: ProductSortBy
  order: 'asc' | 'desc'
}

