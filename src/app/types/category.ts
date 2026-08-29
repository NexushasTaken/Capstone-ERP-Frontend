export interface CategoryListItem {
  id: number
  type: string
  created_At: string
}

export interface RawCategoryListItem {
  id?: number
  Id?: number
  type?: string
  Type?: string
  created_At?: string
  Created_At?: string
}

export interface InsertCategoryPayload {
  categoryName: string
}

export interface UpdateCategoryPayload {
  id: number
  type: string
}
