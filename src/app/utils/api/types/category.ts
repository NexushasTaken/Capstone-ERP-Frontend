export interface RawCategoryListItem {
  id?: number
  Id?: number
  type?: string
  Type?: string
  created_At?: string
  Created_At?: string
}

export interface CategoryListContent {
  categories: RawCategoryListItem[]
  pageCount: number
  rows: number
}

export interface FetchCategoriesParams {
  page?: number
  pageSize?: number
}

export interface InsertCategoryPayload {
  categoryName: string
}

export interface UpdateCategoryPayload {
  id: number
  type: string
}
