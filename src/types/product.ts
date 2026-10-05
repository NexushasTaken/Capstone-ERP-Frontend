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

// API request/response shapes

export interface FetchProductsParams {
  page?: number
  pageSize?: number
  name?: string
  categoryPresent?: 0 | 1
}

export interface ProductListContent {
  products: ProductListItem[]
  pageCount: number
  rows: number
}

export interface InsertProductPayload {
  categoryId: number
  name: string
  price: number
}

export interface UpdateProductPayload {
  categoryId: number
  name: string
  price: number
  id: number
}
