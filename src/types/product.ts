export interface ProductListItem {
  id: number
  categoryId: number | null
  name: string
  price: number
  unitId: number
  /** Unit of measurement, e.g. "pc". */
  unitName: string | null
  categoryName: string | null
  created_At: string
  createdByName: string | null
  updated_At: string | null
  updatedByName: string | null
  /** Stock on hand. Only the inventory/order product picker returns it. */
  stock?: number | null
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
  unitId: number
}

export interface UpdateProductPayload extends InsertProductPayload {
  id: number
}

/** One row of a product import (`POST /Product/import`). */
export interface ProductImportRow {
  name: string
  /** Category name, matched ignoring case; blank means no category. */
  category?: string
  price: number
  /** Unit name, matched ignoring case; blank means pc. */
  unit?: string
  /** Opening stock; set together with reorderPoint to create a stock record. */
  quantity?: number
  reorderPoint?: number
}
