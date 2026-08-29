export interface CategoryListItem {
  id: number
  type: string
  created_By: string | null
  created_At: string
  updated_By: string | null
  updated_At: string | null
  deleted_By: string | null
  deleted_At: string | null
  isActive: boolean
}

export interface RawCategoryListItem {
  id?: number
  Id?: number
  type?: string
  Type?: string
  created_By?: string | null
  Created_By?: string | null
  created_At?: string
  Created_At?: string
  updated_By?: string | null
  Updated_By?: string | null
  updated_At?: string | null
  Updated_At?: string | null
  deleted_By?: string | null
  Deleted_By?: string | null
  deleted_At?: string | null
  Deleted_At?: string | null
  isActive?: boolean
  IsActive?: boolean
}

export interface InsertCategoryPayload {
  categoryName: string
}

export interface UpdateCategoryPayload {
  id: number
  type: string
}

export interface ApiEnvelopeNoContent {
  status: number
  success: boolean
  message: string
}
