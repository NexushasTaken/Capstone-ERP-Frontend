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

export interface InsertProductPayload {
  categoryId: number | null
  name: string
  price: number
}

export interface UpdateProductPayload {
  categoryId: number
  name: string
  price: number
  id: number
}

export type ProductCategoryFilter = 'Categorized' | 'Uncategorized'
