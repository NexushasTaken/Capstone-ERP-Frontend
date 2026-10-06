export interface ProductListItem {
  id: number
  categoryId: number | null
  name: string
  price: number
  categoryName: string | null
  created_At: string
  createdByName: string | null
  updated_At: string | null
  updatedByName: string | null
}

export type ProductCategoryFilter = "Categorized" | "Uncategorized"

export type ProductSortBy = "id" | "name" | "price" | "createdAt"

export interface ProductSortOption {
  label: string
  value: ProductSortBy
  order: "asc" | "desc"
}

// API request/response shapes

export interface FetchProductsParams {
  page?: number
  pageSize?: number
  name?: string
  categoryPresent?: 0 | 1
  /** Sort code, see getProductFilter. */
  filter?: number
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
